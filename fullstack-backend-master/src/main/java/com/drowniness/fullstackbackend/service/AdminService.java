package com.drowniness.fullstackbackend.service;

import com.drowniness.fullstackbackend.exception.UnAuthorizeAccessException;
import com.drowniness.fullstackbackend.model.Admin;
import com.drowniness.fullstackbackend.repository.AdminRepository;
import com.drowniness.fullstackbackend.utils.EmailService;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Objects;
import java.util.Optional;

import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.ADMIN_EMAIL;
import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.ADMIN_NAME;

@Component
public class AdminService {

    private final AdminRepository adminRepository;
    private final EmailService emailService;

    public AdminService(AdminRepository adminRepository,EmailService emailService) {
        this.adminRepository = adminRepository;
        this.emailService = emailService;
    }

    public void sendOtp(String email){
        if(!Objects.equals(email, ADMIN_EMAIL)){
            throw new UnAuthorizeAccessException( "Not a valid email"
            );
        }
        int otp = (int)(Math.random() * 900000) + 100000;
        emailService.sendOtpEmail(ADMIN_EMAIL, ADMIN_NAME, String.valueOf(otp));
        Optional<Admin> findAdmin = adminRepository.findByEmailId(ADMIN_EMAIL);
        findAdmin.get().setOtp(String.valueOf(otp));
        findAdmin.get().setOtpSendTimeStamp(ZonedDateTime.now());
        adminRepository.save(findAdmin.get());
    }

    public String login(String email, String otp){
        Optional<Admin> findAdmin = adminRepository.findByEmailId(email);
        if(findAdmin.isEmpty()) throw new UnAuthorizeAccessException("Not a valid Admin");
        else {
            Admin admin = findAdmin.get();

            if(Objects.equals(admin.getOtp(), otp)){
                return Base64.getEncoder().encodeToString(admin.getId().getBytes(StandardCharsets.UTF_8));
            }

            else throw new UnAuthorizeAccessException("Invalid Otp");
        }
    }
}
