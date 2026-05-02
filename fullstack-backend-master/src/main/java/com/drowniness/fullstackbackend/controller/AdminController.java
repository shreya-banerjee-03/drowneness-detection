package com.drowniness.fullstackbackend.controller;

import com.drowniness.fullstackbackend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin("http://localhost:3000")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/otp/{email}")
    public ResponseEntity<String> generateOtp(
            @PathVariable String email
    ) {
        adminService.sendOtp(email);
        return ResponseEntity.ok("OTP sent to email successfully.");
    }

    @PostMapping("/login")
    public String login(
            @RequestParam String email,
            @RequestParam String otp
    ) {

        if (email.isEmpty()) throw new RuntimeException("Provide email id");
        if (otp.isEmpty()) throw new RuntimeException("Provide otp");

        return adminService.login(email, otp);
    }


}
