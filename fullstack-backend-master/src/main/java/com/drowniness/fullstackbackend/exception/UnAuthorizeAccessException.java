package com.drowniness.fullstackbackend.exception;

public class UnAuthorizeAccessException extends RuntimeException{
    public UnAuthorizeAccessException(String id){
        super("Could not found the user with id "+ id);
    }
}
