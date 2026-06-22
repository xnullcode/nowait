package com.xnullcode.nowait.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    public String storeFile(Long ownerId, MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "nowait/" + ownerId + "/products",
                        "resource_type", "image"
                )
        );
        return (String) uploadResult.get("secure_url");
    }

    public void deleteFile(Long ownerId, String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return;
        try {
            // Extract the public_id from the Cloudinary URL
            // URL format: https://res.cloudinary.com/<cloud>/image/upload/v123/nowait/<id>/products/<filename>
            String publicId = fileUrl
                    .substring(fileUrl.indexOf("/nowait/"))
                    .replace("/", "", 0, 1) // remove leading slash
                    .replaceAll("\\.[^.]+$", ""); // remove file extension
            publicId = publicId.startsWith("/") ? publicId.substring(1) : publicId;
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}