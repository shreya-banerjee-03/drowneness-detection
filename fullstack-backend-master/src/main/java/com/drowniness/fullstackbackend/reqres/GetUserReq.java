package com.drowniness.fullstackbackend.reqres;

import lombok.Data;

@Data
public class GetUserReq {
    private String userId;
    private String adminId;
}
