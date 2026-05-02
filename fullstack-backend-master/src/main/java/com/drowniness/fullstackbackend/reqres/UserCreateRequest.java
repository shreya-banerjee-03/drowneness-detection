package com.drowniness.fullstackbackend.reqres;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String adminId;
    private String fullName;
    private String email;
}
