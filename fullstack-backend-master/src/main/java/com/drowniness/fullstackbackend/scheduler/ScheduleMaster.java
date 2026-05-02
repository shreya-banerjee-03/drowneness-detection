package com.drowniness.fullstackbackend.scheduler;

import com.drowniness.fullstackbackend.model.Admin;
import com.drowniness.fullstackbackend.model.User;
import com.drowniness.fullstackbackend.repository.AdminRepository;
import com.drowniness.fullstackbackend.repository.UserRepository;
import com.drowniness.fullstackbackend.utils.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.ADMIN_EMAIL;
import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.OTP_EXPIRED_TIME;

@Component
public class ScheduleMaster {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ScheduleMaster(AdminRepository adminRepository, UserRepository userRepository, EmailService emailService) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 * * * * ?")
    public void runsEveryOneMinute(){
        Optional<Admin> findAdmin = adminRepository.findByEmailId(ADMIN_EMAIL);
        Admin admin = findAdmin.get();
        ZonedDateTime expiryTime = admin.getOtpSendTimeStamp().plusMinutes(OTP_EXPIRED_TIME);
        if (!expiryTime.isAfter(ZonedDateTime.now()) && admin.getOtp() != null) {
            admin.setOtp(null);
            adminRepository.save(admin);
            System.out.println("OTP removed from admin!");
        }
        
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void runsEveryMidNight() {
        int count = 0;
        List<User> expiredUsers = userRepository.findAllExpired();
        for (User user : expiredUsers) {
            user.setIsExpired(true);
            count++;
            emailService.subscriptionExpired(
                    user.getEmail(),
                    user.getFullName(),
                    user.getProductKey(),
                    false
            );
        }
        userRepository.saveAll(expiredUsers);
        System.out.println("Total "+count+" users set to expired");
    }

}
