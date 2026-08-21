package com.ridetribe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RideTribeApplication {

    public static void main(String[] args) {
        SpringApplication.run(RideTribeApplication.class, args);
    }
}
