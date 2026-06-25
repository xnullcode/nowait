package com.xnullcode.menuservice.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Profile("cloudinary")
public class CloudinaryStorageService implements StorageService {

    @Override
    public String storeFile(Long ownerId, MultipartFile file) throws IOException {
        // TODO: Implement Cloudinary upload logic here
        // E.g., Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        // return uploadResult.get("secure_url").toString();
        throw new UnsupportedOperationException("Cloudinary upload not yet implemented");
    }

    @Override
    public void deleteFile(Long ownerId, String fileUrl) {
        // TODO: Implement Cloudinary delete logic here
        // String publicId = extractPublicId(fileUrl);
        // cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
