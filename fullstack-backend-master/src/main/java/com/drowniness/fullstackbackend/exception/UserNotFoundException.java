package com.drowniness.fullstackbackend.exception;
/* Created by Arjun Gautam */

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(String id){
        super("Could not found the user with id "+ id);
    }
}
