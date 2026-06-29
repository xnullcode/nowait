#!/bin/bash

# ──────────────────────────────────────────────────────────────
# Nowait Cafe — Kubernetes Management Console
# A terminal-based menu for managing the full K8s stack.
# Usage:  ./nowait.sh
# ──────────────────────────────────────────────────────────────

# ─── Colors ──────────────────────────────────────────────────
BOLD='\033[1m'
DIM='\033[2m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
MAGENTA='\033[35m'
BLUE='\033[34m'
RESET='\033[0m'

# ─── Helpers ─────────────────────────────────────────────────
banner() {
    clear
    echo -e "${BOLD}${CYAN}"
    echo "  ┌─────────────────────────────────────────┐"
    echo "  │             NOWAIT CONSOLE              │"
    echo "  └─────────────────────────────────────────┘"
    echo -e "${RESET}"
}

info()    { echo -e "  ${CYAN}ℹ${RESET}  $1"; }
success() { echo -e "  ${GREEN}✓${RESET}  $1"; }
warn()    { echo -e "  ${YELLOW}⚠${RESET}  $1"; }
fail()    { echo -e "  ${RED}✗${RESET}  $1"; }
divider() { echo -e "  ${DIM}─────────────────────────────────────────${RESET}"; }

press_enter() {
    echo ""
    read -rp "  Press Enter to return to menu..." _
}

is_minikube_running() {
    sudo minikube status --format='{{.Host}}' 2>/dev/null | grep -q "Running"
}

is_port_forward_running() {
    pgrep -f "kubectl port-forward svc/frontend 3000:80" &>/dev/null || pgrep -f "sudo kubectl port-forward svc/frontend 3000:80" &>/dev/null
}

is_ngrok_running() {
    pgrep -f "ngrok http 3000" &>/dev/null
}

# ─── 1. Status ───────────────────────────────────────────────
show_status() {
    banner
    echo -e "  ${BOLD}System Status${RESET}"
    divider
    echo ""

    # Minikube
    if is_minikube_running; then
        success "Minikube         ${GREEN}Running${RESET}"
    else
        fail "Minikube         ${RED}Stopped${RESET}"
        echo ""
        warn "Cluster is not running. Start it first."
        press_enter
        return
    fi

    # Port-forward
    if is_port_forward_running; then
        success "Port-forward     ${GREEN}Active${RESET}  →  http://localhost:3000"
    else
        fail "Port-forward     ${RED}Inactive${RESET}"
    fi

    # Ngrok
    if is_ngrok_running; then
        NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -oP '"public_url":"https://[^"]+' | head -1 | cut -d'"' -f4)
        if [[ -n "$NGROK_URL" ]]; then
            success "Ngrok            ${GREEN}Active${RESET}  →  $NGROK_URL"
        else
            success "Ngrok            ${GREEN}Active${RESET}  →  check http://127.0.0.1:4040"
        fi
    else
        echo -e "  ${DIM}○${RESET}  Ngrok            ${DIM}Not running${RESET}"
    fi

    echo ""
    divider
    echo -e "  ${BOLD}Pod Status${RESET}"
    divider
    echo ""
    sudo kubectl get pods --no-headers 2>/dev/null | while read -r line; do
        POD_NAME=$(echo "$line" | awk '{print $1}')
        STATUS=$(echo "$line" | awk '{print $3}')
        READY=$(echo "$line" | awk '{print $2}')
        if [[ "$STATUS" == "Running" ]]; then
            echo -e "  ${GREEN}●${RESET}  ${POD_NAME}  ${DIM}(${READY} ready)${RESET}"
        else
            echo -e "  ${RED}●${RESET}  ${POD_NAME}  ${YELLOW}${STATUS}${RESET}"
        fi
    done

    press_enter
}

# ─── 2. Start ────────────────────────────────────────────────
start_menu() {
    banner
    echo -e "  ${BOLD}Start Services${RESET}"
    divider
    echo ""
    echo -e "  ${CYAN}1${RESET})  Start Local       ${DIM}(localhost:3000 only)${RESET}"
    echo -e "  ${CYAN}2${RESET})  Start Public       ${DIM}(localhost:3000 + ngrok tunnel)${RESET}"
    echo -e "  ${CYAN}3${RESET})  Start Ngrok Only   ${DIM}(cluster already running)${RESET}"
    echo -e "  ${CYAN}0${RESET})  Back"
    echo ""
    read -rp "  Select: " choice

    case $choice in
        1) do_start false ;;
        2) do_start true ;;
        3) do_ngrok_only ;;
        0|"") return ;;
        *) warn "Invalid option." && sleep 1 ;;
    esac
}

do_start() {
    local with_ngrok=$1
    banner
    echo -e "  ${BOLD}Starting Nowait Cafe...${RESET}"
    divider
    echo ""

    # Minikube
    if is_minikube_running; then
        success "Minikube already running"
    else
        info "Starting Minikube..."
        sudo minikube start --force
        echo ""
        success "Minikube started"
    fi

    # Wait for pods
    echo ""
    info "Waiting for pods to become ready..."
    if sudo kubectl wait --for=condition=Ready pods --all --timeout=180s 2>/dev/null; then
        success "All pods are healthy"
    else
        warn "Some pods may not be ready yet. Check status."
    fi

    # Port-forward
    echo ""
    if is_port_forward_running; then
        success "Port-forward already active"
    else
        info "Starting port-forward..."
        sudo kubectl port-forward svc/frontend 3000:80 &>/dev/null &
        sleep 2
        if is_port_forward_running; then
            success "Frontend live at ${BOLD}http://localhost:3000${RESET}"
        else
            fail "Port-forward failed. Try again from the menu."
        fi
    fi

    # Ngrok
    if $with_ngrok; then
        echo ""
        do_ngrok_only_inner
    fi

    press_enter
}

do_ngrok_only() {
    banner
    echo -e "  ${BOLD}Starting Ngrok Tunnel${RESET}"
    divider
    echo ""

    if ! is_minikube_running; then
        fail "Minikube is not running. Start the cluster first."
        press_enter
        return
    fi

    if ! is_port_forward_running; then
        warn "Port-forward is not active. Starting it first..."
        sudo kubectl port-forward svc/frontend 3000:80 &>/dev/null &
        sleep 2
    fi

    do_ngrok_only_inner
    press_enter
}

do_ngrok_only_inner() {
    if ! command -v ngrok &>/dev/null; then
        fail "Ngrok is not installed."
        return
    fi

    if is_ngrok_running; then
        success "Ngrok is already running"
        NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -oP '"public_url":"https://[^"]+' | head -1 | cut -d'"' -f4)
        [[ -n "$NGROK_URL" ]] && success "Public URL: ${BOLD}$NGROK_URL${RESET}"
        return
    fi

    info "Starting ngrok..."
    ngrok http 3000 --log=stdout &>/dev/null &
    sleep 4

    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | grep -oP '"public_url":"https://[^"]+' | head -1 | cut -d'"' -f4)
    if [[ -n "$NGROK_URL" ]]; then
        success "Public URL: ${BOLD}$NGROK_URL${RESET}"
    else
        warn "Ngrok started but URL not available. Check http://127.0.0.1:4040"
    fi
}

# ─── 3. Stop ─────────────────────────────────────────────────
stop_menu() {
    banner
    echo -e "  ${BOLD}Stop Services${RESET}"
    divider
    echo ""
    echo -e "  ${CYAN}1${RESET})  Stop All           ${DIM}(ngrok + port-forward + minikube)${RESET}"
    echo -e "  ${CYAN}2${RESET})  Stop Ngrok Only    ${DIM}(keep cluster running locally)${RESET}"
    echo -e "  ${CYAN}3${RESET})  Stop Port-forward  ${DIM}(disconnect localhost:3000)${RESET}"
    echo -e "  ${CYAN}0${RESET})  Back"
    echo ""
    read -rp "  Select: " choice

    case $choice in
        1) do_stop_all ;;
        2) do_stop_ngrok ;;
        3) do_stop_portforward ;;
        0|"") return ;;
        *) warn "Invalid option." && sleep 1 ;;
    esac
}

do_stop_all() {
    banner
    echo -e "  ${BOLD}Stopping Everything...${RESET}"
    divider
    echo ""

    do_stop_ngrok_inner
    do_stop_portforward_inner

    info "Stopping Minikube (data will be preserved)..."
    sudo minikube stop
    success "Minikube stopped"

    press_enter
}

do_stop_ngrok() {
    banner
    do_stop_ngrok_inner
    press_enter
}

do_stop_ngrok_inner() {
    if is_ngrok_running; then
        pkill -f "ngrok http 3000" 2>/dev/null
        success "Ngrok stopped"
    else
        echo -e "  ${DIM}○${RESET}  Ngrok was not running"
    fi
}

do_stop_portforward() {
    banner
    do_stop_portforward_inner
    press_enter
}

do_stop_portforward_inner() {
    if is_port_forward_running; then
        pkill -f "kubectl port-forward svc/frontend 3000:80" 2>/dev/null
        success "Port-forward stopped"
    else
        echo -e "  ${DIM}○${RESET}  Port-forward was not running"
    fi
}

# ─── 4. Logs ─────────────────────────────────────────────────
logs_menu() {
    banner
    echo -e "  ${BOLD}View Logs${RESET}"
    divider
    echo ""

    if ! is_minikube_running; then
        fail "Minikube is not running."
        press_enter
        return
    fi

    # Build pod list dynamically
    mapfile -t PODS < <(sudo kubectl get pods --no-headers -o custom-columns=":metadata.name" 2>/dev/null)

    if [[ ${#PODS[@]} -eq 0 ]]; then
        fail "No pods found."
        press_enter
        return
    fi

    for i in "${!PODS[@]}"; do
        echo -e "  ${CYAN}$((i+1))${RESET})  ${PODS[$i]}"
    done
    echo -e "  ${CYAN}0${RESET})  Back"
    echo ""
    read -rp "  Select pod: " choice

    if [[ "$choice" == "0" || -z "$choice" ]]; then
        return
    fi

    idx=$((choice - 1))
    if [[ $idx -ge 0 && $idx -lt ${#PODS[@]} ]]; then
        local pod="${PODS[$idx]}"
        banner
        echo -e "  ${BOLD}Logs: ${CYAN}${pod}${RESET}"
        echo -e "  ${DIM}(showing last 80 lines, press Ctrl+C to stop live tail)${RESET}"
        divider
        echo ""
        sudo kubectl logs "$pod" --tail=80 -f 2>/dev/null
        press_enter
    else
        warn "Invalid selection."
        sleep 1
    fi
}

# ─── 5. Rebuild Frontend ────────────────────────────────────
rebuild_frontend() {
    banner
    echo -e "  ${BOLD}Rebuild Frontend${RESET}"
    divider
    echo ""

    if ! is_minikube_running; then
        fail "Minikube is not running. Start it first."
        press_enter
        return
    fi

    info "Building frontend Docker image inside Minikube..."
    echo ""

    eval $(sudo minikube docker-env)
    sudo docker build -t nowait/frontend:latest ./frontend

    echo ""
    info "Restarting frontend deployment..."
    sudo kubectl rollout restart deployment frontend
    sleep 2

    success "Frontend rebuilt and redeployed!"
    echo ""
    warn "Port-forward may drop briefly. It will reconnect automatically."

    # Restart port-forward if it was running
    if ! is_port_forward_running; then
        sleep 5
        sudo kubectl port-forward svc/frontend 3000:80 &>/dev/null &
        sleep 2
        is_port_forward_running && success "Port-forward reconnected"
    fi

    press_enter
}

# ─── Main Menu ───────────────────────────────────────────────
main_menu() {
    while true; do
        banner

        # Quick status line
        if is_minikube_running; then
            echo -e "  Cluster: ${GREEN}●${RESET} Running    Local: $(is_port_forward_running && echo -e "${GREEN}●${RESET} Active" || echo -e "${RED}●${RESET} Inactive")    Ngrok: $(is_ngrok_running && echo -e "${GREEN}●${RESET} Active" || echo -e "${DIM}○ Off${RESET}")"
        else
            echo -e "  Cluster: ${RED}●${RESET} Stopped"
        fi

        echo ""
        divider
        echo ""
        echo -e "  ${CYAN}1${RESET})  ${BOLD}Start${RESET}             Launch the cluster & services"
        echo -e "  ${CYAN}2${RESET})  ${BOLD}Stop${RESET}              Shut down services"
        echo -e "  ${CYAN}3${RESET})  ${BOLD}Status${RESET}            View cluster & pod health"
        echo -e "  ${CYAN}4${RESET})  ${BOLD}Logs${RESET}              Tail logs from a pod"
        echo -e "  ${CYAN}5${RESET})  ${BOLD}Rebuild Frontend${RESET}  Rebuild & redeploy the frontend"
        echo ""
        echo -e "  ${CYAN}0${RESET})  ${DIM}Exit${RESET}"
        echo ""
        read -rp "  Select: " choice

        case $choice in
            1) start_menu ;;
            2) stop_menu ;;
            3) show_status ;;
            4) logs_menu ;;
            5) rebuild_frontend ;;
            0) echo "" && echo -e "  ${DIM}Goodbye! ☕${RESET}" && echo "" && exit 0 ;;
            *) warn "Invalid option." && sleep 1 ;;
        esac
    done
}

# ─── Entry Point ─────────────────────────────────────────────
main_menu
