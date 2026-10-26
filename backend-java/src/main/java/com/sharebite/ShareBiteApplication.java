package com.sharebite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShareBiteApplication {

    public static void main(String[] args) {
        System.out.println("=======================================================");
        System.out.println(" 🍽️  ShareBite Java Spring Boot Application Starting");
        System.out.println(" 🌐 Default Port: 3000");
        System.out.println("=======================================================");
        SpringApplication.run(ShareBiteApplication.class, args);
    }
}
