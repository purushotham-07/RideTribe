package com.ridetribe.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;
    private final boolean isCloudinaryConfigured;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:${CLOUDINARY_CLOUD_NAME:}}") String cloudName,
            @Value("${cloudinary.api-key:${CLOUDINARY_API_KEY:}}") String apiKey,
            @Value("${cloudinary.api-secret:${CLOUDINARY_API_SECRET:}}") String apiSecret) {

        if (cloudName != null && !cloudName.isBlank() &&
            apiKey != null && !apiKey.isBlank() &&
            apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            this.isCloudinaryConfigured = true;
            logger.info("✅ Cloudinary initialized with cloud_name: {}", cloudName);
        } else {
            this.cloudinary = null;
            this.isCloudinaryConfigured = false;
            logger.info("ℹ️ Cloudinary credentials not provided in environment. Using embedded data URL fallback for local development.");
        }
    }

    /**
     * Uploads an image file to Cloudinary (or fallback base64 Data URI).
     *
     * @param file the MultipartFile to upload
     * @param folder the target folder in Cloudinary (e.g. "ridetribe/avatars", "ridetribe/vehicles")
     * @return the secure HTTPS URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        if (isCloudinaryConfigured && cloudinary != null) {
            try {
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", folder != null ? folder : "ridetribe",
                        "resource_type", "image"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                logger.info("Uploaded image to Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (Exception e) {
                logger.error("Cloudinary upload failed: {}", e.getMessage(), e);
                // Fallback to data URI on error
            }
        }

        // Fallback for local development without Cloudinary credentials:
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
        return "data:" + contentType + ";base64," + base64;
    }
}
