package com.drowniness.fullstackbackend.utils;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Component
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void sendOtpEmail(String to, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("otp", otp);

            String htmlContent = templateEngine.process("otp-email", context);

            helper.setTo(to);
            helper.setSubject("Your OTP Code");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void customerCreated(String to, String fullName, String productKey) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("email", to);
            context.setVariable("productKey", productKey);

            String htmlContent = templateEngine.process("user-invoice", context);

            helper.setTo(to);
            helper.setSubject("Purchase Confirm");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void customerMacAssigned(String to, String fullName, String productKey, String mac, String expiredOn) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("email", to);
            context.setVariable("productKey", productKey);
            context.setVariable("macAddress",mac);
            context.setVariable("expiredOn", expiredOn);

            String htmlContent = templateEngine.process("mac-assign-confirmation", context);

            helper.setTo(to);
            helper.setSubject("Purchase Confirm");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void verifyUser(String to, String fullName, Boolean status){
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("email", to);
            if(status){
                context.setVariable("status", "Approved");
            }
            else {
                context.setVariable("status", "Rejected");
            }

            String htmlContent = templateEngine.process("user-verification", context);

            helper.setTo(to);
            helper.setSubject("Your Account Status Changed");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void subscriptionExpired(String to, String fullName, String productKey, Boolean force){
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            Context context = new Context();
            context.setVariable("fullName", fullName);
            context.setVariable("email", to);
            context.setVariable("productKey", productKey);
            if(force){
                context.setVariable("force", "This Action is taken Forcefully By An ADMIN");
            }
            String htmlContent = templateEngine.process("subscription-expired", context);

            helper.setTo(to);
            helper.setSubject("Subscription Ended");
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}
