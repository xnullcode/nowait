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
            // Extract public_id from Cloudinary URL
            // e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/nowait/1/products/abc.jpg
            // public_id = nowait/1/products/abc  (no extension)
            String publicId = fileUrl.substring(fileUrl.indexOf("/nowait/") + 1);
            publicId = publicId.replaceAll("\\.[^.]+$", ""); // strip file extension
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}