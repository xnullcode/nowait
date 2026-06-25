package com.xnullcode.menuservice.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface StorageService {
    String storeFile(Long ownerId, MultipartFile file) throws IOException;
    void deleteFile(Long ownerId, String fileUrl);
}
