package com.drowniness.fullstackbackend.reqres;

import lombok.Data;

@Data
public class DeleteUserReq {
    private String userId;
    private String adminId;
}
