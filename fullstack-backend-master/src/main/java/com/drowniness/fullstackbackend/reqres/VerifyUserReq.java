package com.drowniness.fullstackbackend.reqres;

import lombok.Data;

@Data
public class VerifyUserReq {
    private String userId;
    private String adminId;
    private Boolean verifyStaus;
}
