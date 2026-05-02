package com.drowniness.fullstackbackend.controller;

import com.drowniness.fullstackbackend.exception.UnAuthorizeAccessException;
import com.drowniness.fullstackbackend.exception.UserNotFoundException;
import com.drowniness.fullstackbackend.model.User;
import com.drowniness.fullstackbackend.reqres.*;
import com.drowniness.fullstackbackend.service.UserService;
import com.drowniness.fullstackbackend.utils.VerifyAdminAccess;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin("http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final VerifyAdminAccess verifyAdminAccess;

    public UserController(UserService userService, VerifyAdminAccess verifyAdminAccess) {
        this.userService = userService;
        this.verifyAdminAccess = verifyAdminAccess;
    }

    @PostMapping("/addUser")
    User newUser(
            @RequestBody UserCreateRequest userCreateRequest
    ) {
        if (userCreateRequest.getAdminId().isEmpty()) throw new UnAuthorizeAccessException("Provide Id to validate");
        if (verifyAdminAccess.verifyAdmin(userCreateRequest.getAdminId()))
            throw new UnAuthorizeAccessException("You don't have access!");
        Optional<User> user =  userService.createUser(userCreateRequest.getFullName(), userCreateRequest.getEmail());
        if(user.isEmpty()) throw new UserNotFoundException("Not an valid email");
        return user.get();
    }

    @GetMapping("/getAllUsers/{adminId}")
    List<User> getAllUsers(
            @PathVariable String adminId
    ) {
        if (adminId.isEmpty()) throw new UnAuthorizeAccessException("Provide Id to validate");
        if (verifyAdminAccess.verifyAdmin(adminId)) throw new UnAuthorizeAccessException("You don't have access!");
        return userService.findAll();
    }

    @PostMapping("/getUserById")
    User getUserById(
            @RequestBody GetUserReq getUserReq
    ) {
        if (getUserReq.getAdminId().isEmpty()) throw new UnAuthorizeAccessException("Provide Id to validate");
        if (verifyAdminAccess.verifyAdmin(getUserReq.getAdminId()))
            throw new UnAuthorizeAccessException("You don't have access!");
        return userService.findById(getUserReq.getUserId())
                .orElseThrow(() -> new UserNotFoundException(getUserReq.getUserId()));
    }

    @PostMapping("/updateUser")
    User updateUser(
            @RequestBody UpdateUser updateUser
    ) {
        if (updateUser.getAdminId().isEmpty()) throw new UnAuthorizeAccessException("Provide Id to validate");
        if (verifyAdminAccess.verifyAdmin(updateUser.getAdminId()))
            throw new UnAuthorizeAccessException("You don't have access!");
        return userService.updateUser(updateUser);
    }

    @PostMapping("/deleteUser")
    String deleteUser(
            @RequestBody DeleteUserReq deleteUserReq
    ) {
        if (deleteUserReq.getAdminId().isEmpty()) throw new UnAuthorizeAccessException("Provide Id to validate");
        if (verifyAdminAccess.verifyAdmin(deleteUserReq.getAdminId()))
            throw new UnAuthorizeAccessException("You don't have access!");
        if (!userService.existsById(deleteUserReq.getUserId())) {
            throw new UserNotFoundException(deleteUserReq.getUserId());
        }
        userService.deleteById(deleteUserReq.getUserId());
        return "User with id " + deleteUserReq.getUserId() + " has been deleted success.";
    }

    @GetMapping("/verifyPurchase")
    Boolean verifyPurchase(
            @RequestParam("productKey") String productKey,
            @RequestParam("mac") String mac
    ) {
        if (productKey == null) throw new RuntimeException("Provide product key");
        if (mac == null) throw new RuntimeException("Provide MAC Address");

        return userService.verifyPurchase(productKey, mac);
    }
}
