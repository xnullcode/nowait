#!/bin/bash

# Gateway
nohup java -jar gateway-service/target/gateway-service-0.0.1-SNAPSHOT.jar > gateway.log 2>&1 &

# Auth
export DATABASE_URL=jdbc:postgresql://localhost:5432/auth_db
export DB_USER=nowait_user
export DB_PASSWORD=nowait_password
nohup java -jar auth-service/target/auth-service-0.0.1-SNAPSHOT.jar > auth.log 2>&1 &

# Menu
export DATABASE_URL=jdbc:postgresql://localhost:5432/menu_db
export DB_USER=nowait_user
export DB_PASSWORD=nowait_password
nohup java -jar menu-service/target/menu-service-0.0.1-SNAPSHOT.jar > menu.log 2>&1 &

# Order
export DATABASE_URL=jdbc:postgresql://localhost:5432/order_db
export DB_USER=nowait_user
export DB_PASSWORD=nowait_password
export MENU_SERVICE_URL=http://localhost:8082
nohup java -jar order-service/target/order-service-0.0.1-SNAPSHOT.jar > order.log 2>&1 &

# Payment
export DATABASE_URL=jdbc:postgresql://localhost:5432/payment_db
export DB_USER=nowait_user
export DB_PASSWORD=nowait_password
export ORDER_SERVICE_URL=http://localhost:8083
nohup java -jar payment-service/target/payment-service-0.0.1-SNAPSHOT.jar > payment.log 2>&1 &

echo "All services started."
