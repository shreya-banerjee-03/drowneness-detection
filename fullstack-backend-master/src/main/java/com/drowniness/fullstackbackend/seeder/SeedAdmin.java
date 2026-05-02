package com.drowniness.fullstackbackend.seeder;

import com.drowniness.fullstackbackend.model.Admin;
import com.drowniness.fullstackbackend.repository.AdminRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.Optional;

import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.ADMIN_EMAIL;
import static com.drowniness.fullstackbackend.constants.KeywordsAndConstants.ADMIN_NAME;

@Component
public class SeedAdmin {

    private final AdminRepository adminRepository;

    public SeedAdmin(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @PostConstruct
    public void StartSeeding() throws Exception {
        System.out.println("Start Seeding....");
        Optional<Admin> findIfAdminAlreadyExits = adminRepository.findByEmailId(ADMIN_EMAIL);
        if(findIfAdminAlreadyExits.isEmpty()){
            Admin admin = new Admin();
            admin.setEmail(ADMIN_EMAIL);
            admin.setFullName(ADMIN_NAME);
            adminRepository.save(admin);
            System.out.println("Seeding Completed");
        }
        else {
            System.out.println("Admin already seeded!");
        }
    }
}
