package com.drowniness.fullstackbackend.service;

import com.drowniness.fullstackbackend.exception.UnAuthorizeAccessException;
import com.drowniness.fullstackbackend.model.Admin;
import com.drowniness.fullstackbackend.model.User;
import com.drowniness.fullstackbackend.repository.AdminRepository;
import com.drowniness.fullstackbackend.repository.UserRepository;
import com.drowniness.fullstackbackend.reqres.UpdateUser;
import com.drowniness.fullstackbackend.reqres.VerifyUserReq;
import com.drowniness.fullstackbackend.utils.EmailService;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component
public class UserService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, AdminRepository adminRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.emailService = emailService;
    }

    public Optional<User> createUser(String fullName, String email) {
        User newUser = new User();
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        newUser.setIsExpired(false);
        newUser.setIsVerified(true);
        newUser.setExpiredOn(ZonedDateTime.now().plusYears(1));
        try{
            emailService.customerCreated(
                    newUser.getEmail(),
                    newUser.getFullName(),
                    newUser.getProductKey()
            );
            userRepository.save(newUser);
        } catch (Exception e){
            System.out.println(e + "Fai;ed to send mail");
            return  Optional.empty();
        }

        return Optional.of(newUser);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Boolean existsById(String id) {
        return userRepository.existsById(id);
    }

    public User updateUser(UpdateUser updateUser) {
        Optional<User> findUser = userRepository.findById(updateUser.getUserId());

        if (findUser.isEmpty()) throw new UnAuthorizeAccessException("No user found with this id");

        findUser.get().setEmail(updateUser.getEmail());
        findUser.get().setMacAddress(updateUser.getMacAddress());
        findUser.get().setFullName(updateUser.getFullName());
        findUser.get().setIsVerified(updateUser.getIsVerified());
        findUser.get().setIsMacAssigned(updateUser.getIsMacAssigned());
        emailService.verifyUser(
                findUser.get().getEmail(),
                findUser.get().getFullName(),
                findUser.get().getIsVerified()
        );
        return userRepository.save(findUser.get());
    }

    public void deleteById(String id) {
        Optional<User> findUser = userRepository.findById(id);
        if(findUser.isEmpty()) throw new RuntimeException("No user found");

        emailService.subscriptionExpired(
                findUser.get().getEmail(),
                findUser.get().getFullName(),
                findUser.get().getProductKey(),
                true
        );
        userRepository.deleteById(id);
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    public Boolean verifyPurchase(String productKey, String mac) {

        Optional<User> findAssignedUserWithProductKey = userRepository.findByProductKey(productKey);

        if (findAssignedUserWithProductKey.isEmpty()) {
            return false;
        }

        if (findAssignedUserWithProductKey.get().getIsMacAssigned()) {
            return Objects.equals(findAssignedUserWithProductKey.get().getMacAddress(), mac);
        }
        ZonedDateTime time = ZonedDateTime.now();
        findAssignedUserWithProductKey.get().setMacAddress(mac);
        findAssignedUserWithProductKey.get().setIsMacAssigned(true);
        findAssignedUserWithProductKey.get().setExpiredOn(time);
        User savedUser = userRepository.save(findAssignedUserWithProductKey.get());
        emailService.customerMacAssigned(
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getProductKey(),
                mac,
                time.toString().split("T")[0]
        );
        return true;
    }

}

