package com.drowniness.fullstackbackend.utils;

import com.drowniness.fullstackbackend.constants.Config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.ADMIN_EMAIL;

@Configuration
public class MailConfig {

    private final Config config;

    public MailConfig(Config config) {
        this.config = config;
    }

    @Bean
    public JavaMailSender getJavaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername(ADMIN_EMAIL);
        mailSender.setPassword(config.getEmailPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        return mailSender;
    }
}
