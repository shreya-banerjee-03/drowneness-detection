package com.drowniness.fullstackbackend.constants;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Data
@Component
public class Config {

    @Value("${email.password}")
    private String emailPassword;

    @Value("${encryption.key}")
    private String encryptionKey;

    @PostConstruct
    public void init() {
        String Email_Password = emailPassword;
        String Encryption_Key = encryptionKey;
    }
}
