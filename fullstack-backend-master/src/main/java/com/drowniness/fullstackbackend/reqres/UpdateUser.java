package com.drowniness.fullstackbackend.reqres;

import lombok.Data;

@Data
public class UpdateUser {
    private String adminId;
    private String userId;
    private String fullName;
    private String email;
    private Boolean isVerified;
    private String macAddress;
    private Boolean isMacAssigned;
}
