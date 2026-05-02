package com.drowniness.fullstackbackend.utils;

import com.drowniness.fullstackbackend.model.Admin;
import com.drowniness.fullstackbackend.repository.AdminRepository;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;

@Component
public class VerifyAdminAccess {

    private final AdminRepository adminRepository;

    public VerifyAdminAccess(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public boolean verifyAdmin(String id) {
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(id);
            String decodedId = new String(decodedBytes, StandardCharsets.UTF_8);

            Optional<Admin> findAdmin = adminRepository.findById(decodedId);

            return findAdmin.isEmpty();
        } catch (IllegalArgumentException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }


}
