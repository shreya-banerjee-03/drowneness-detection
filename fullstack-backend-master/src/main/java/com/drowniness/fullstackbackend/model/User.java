package com.drowniness.fullstackbackend.model;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;


@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id = UUID.randomUUID().toString();
    private String fullName;
    private String email;
    private String productKey = "PROD-KEY-" + UUID.randomUUID() + "-D-" + ZonedDateTime.now().toString().split("T")[0];
    private Boolean isVerified = false;
    private String macAddress;
    private Boolean isMacAssigned = false;
    @Column(nullable = false, updatable = false)
    private ZonedDateTime createdDate = ZonedDateTime.now();
    @Column(nullable = false, updatable = false)
    private ZonedDateTime expiredOn = ZonedDateTime.now().plusYears(1);
    private Boolean isExpired = false;
}
