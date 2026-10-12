
package com.placement.backend;

import com.placement.backend.entity.Department;
import com.placement.backend.repository.DepartmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PlacementBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlacementBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner seedDepartments(DepartmentRepository departmentRepository) {
        return args -> {
            String[] departments = {
                "Computer Science and Engineering",
                "Artificial Intelligence",
                "Information Technology",
                "Electronics and Communication Engineering",
                "Electrical and Electronics Engineering",
                "Mechanical Engineering",
                "Civil Engineering"
            };

            for (String name : departments) {
                if (!departmentRepository.existsByName(name)) {
                    Department department = new Department();
                    department.setName(name);
                    departmentRepository.save(department);
                }
            }

            System.out.println("Department initialization completed.");
        };
    }
}
