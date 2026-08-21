package com.ridetribe.config;

import com.ridetribe.model.*;
import com.ridetribe.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final RideIntentRepository rideIntentRepository;
    private final RideGroupRepository rideGroupRepository;
    private final RideGroupMemberRepository rideGroupMemberRepository;
    private final RatingRepository ratingRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already seeded. Skipping initial data load.");
            return;
        }

        logger.info("🌱 Seeding initial RideTribe Bangalore riders, intents, and demo groups...");

        String defaultPass = passwordEncoder.encode("password123");

        User rahul = User.builder()
                .name("Rahul Sharma")
                .email("rahul@ridetribe.in")
                .passwordHash(defaultPass)
                .phone("+91 98860 11223")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80")
                .preferredMode(TravelMode.BIKE)
                .vehicleModel("Royal Enfield Himalayan 450 (Kaza Brown)")
                .vehicleNumber("KA-03-MR-4589")
                .emergencyContactName("Sunita Sharma (Mother)")
                .emergencyContactPhone("+91 98450 12345")
                .avgRating(4.9)
                .totalRatings(18)
                .ridesCompleted(12)
                .bio("Weekend trail explorer. Love early morning breakfast rides to Nandi & Lepakshi.")
                .build();

        User ananya = User.builder()
                .name("Ananya Rao")
                .email("ananya@ridetribe.in")
                .passwordHash(defaultPass)
                .phone("+91 97410 44556")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80")
                .preferredMode(TravelMode.BIKE)
                .vehicleModel("KTM 390 Adventure (Orange)")
                .vehicleNumber("KA-04-EK-9921")
                .emergencyContactName("Karthik Rao (Brother)")
                .emergencyContactPhone("+91 97410 99887")
                .avgRating(4.8)
                .totalRatings(14)
                .ridesCompleted(9)
                .bio("Corner carver & GPS navigator. Always up for brisk highway cruising.")
                .build();

        User vikram = User.builder()
                .name("Vikram Reddy")
                .email("vikram@ridetribe.in")
                .passwordHash(defaultPass)
                .phone("+91 99001 77889")
                .avatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80")
                .preferredMode(TravelMode.CAR)
                .vehicleModel("Mahindra Thar 4x4 (Rocky Black)")
                .vehicleNumber("KA-51-MD-7777")
                .emergencyContactName("Divya Reddy (Spouse)")
                .emergencyContactPhone("+91 99001 11222")
                .avgRating(5.0)
                .totalRatings(8)
                .ridesCompleted(5)
                .bio("Overlander & photographer. Carries recovery gear and emergency puncture kit.")
                .build();

        User sneha = User.builder()
                .name("Sneha Iyer")
                .email("sneha@ridetribe.in")
                .passwordHash(defaultPass)
                .phone("+91 96110 33221")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                .preferredMode(TravelMode.BIKE)
                .vehicleModel("BMW G310GS (Rallye Style)")
                .vehicleNumber("KA-01-JJ-3004")
                .emergencyContactName("Meera Iyer (Sister)")
                .emergencyContactPhone("+91 96110 99000")
                .avgRating(4.9)
                .totalRatings(22)
                .ridesCompleted(15)
                .bio("Passionate about mountain twisties. Certified first responder.")
                .build();

        User rohan = User.builder()
                .name("Rohan Hegde")
                .email("rohan@ridetribe.in")
                .passwordHash(defaultPass)
                .phone("+91 98455 88990")
                .avatarUrl("https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80")
                .preferredMode(TravelMode.BIKE)
                .vehicleModel("Triumph Scrambler 400X (Carnival Red)")
                .vehicleNumber("KA-05-NB-1029")
                .emergencyContactName("Venkatesh Hegde (Father)")
                .emergencyContactPhone("+91 98455 00011")
                .avgRating(4.7)
                .totalRatings(10)
                .ridesCompleted(6)
                .bio("Coffee enthusiast. The destination is always a good filter coffee spot!")
                .build();

        User priya = User.builder()
                .name("Priya Menon")
                .email("priya@ridetribe.in")
                .passwordHash(defaultPass)
                .phone("+91 98800 22334")
                .avatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
                .preferredMode(TravelMode.CAR)
                .vehicleModel("Hyundai Creta SX (Titan Grey)")
                .vehicleNumber("KA-02-MM-6612")
                .emergencyContactName("Arun Menon (Father)")
                .emergencyContactPhone("+91 98800 99999")
                .avgRating(4.8)
                .totalRatings(6)
                .ridesCompleted(4)
                .bio("Weekend road trip lover. Smooth and disciplined driving.")
                .build();

        userRepository.saveAll(Arrays.asList(rahul, ananya, vikram, sneha, rohan, priya));

        LocalDate thisSaturday = LocalDate.now().plusDays((6 - LocalDate.now().getDayOfWeek().getValue() + 7) % 7);
        if (thisSaturday.equals(LocalDate.now())) {
            thisSaturday = thisSaturday.plusDays(7);
        }
        LocalDate thisSunday = thisSaturday.plusDays(1);

        // Pre-formed Demo Group (Nandi Hills Sunrise Biker Group)
        RideGroup nandiGroup = RideGroup.builder()
                .destination("Nandi Hills")
                .travelMode(TravelMode.BIKE)
                .rideDate(thisSaturday)
                .scheduledTime(LocalTime.of(5, 30))
                .meetingPointName("Esteem Mall, Hebbal Flyover (Airport Rd)")
                .meetingPointLat(13.0428)
                .meetingPointLng(77.5912)
                .destinationLat(13.3702)
                .destinationLng(77.6835)
                .estimatedDistanceKm(60.0)
                .status(RideGroupStatus.CONFIRMED)
                .build();

        nandiGroup = rideGroupRepository.save(nandiGroup);

        RideGroupMember m1 = RideGroupMember.builder()
                .rideGroup(nandiGroup)
                .user(rahul)
                .isLead(true)
                .onMyWay(true)
                .currentLat(13.0428)
                .currentLng(77.5912)
                .currentSpeed(0.0)
                .currentHeading(0.0)
                .build();

        RideGroupMember m2 = RideGroupMember.builder()
                .rideGroup(nandiGroup)
                .user(ananya)
                .isLead(false)
                .onMyWay(true)
                .currentLat(13.0380)
                .currentLng(77.5890)
                .currentSpeed(35.0)
                .currentHeading(15.0)
                .build();

        RideGroupMember m3 = RideGroupMember.builder()
                .rideGroup(nandiGroup)
                .user(sneha)
                .isLead(false)
                .onMyWay(false)
                .currentLat(13.0100)
                .currentLng(77.6200)
                .currentSpeed(0.0)
                .currentHeading(0.0)
                .build();

        RideGroupMember m4 = RideGroupMember.builder()
                .rideGroup(nandiGroup)
                .user(rohan)
                .isLead(false)
                .onMyWay(true)
                .currentLat(13.0450)
                .currentLng(77.5920)
                .currentSpeed(20.0)
                .currentHeading(350.0)
                .build();

        rideGroupMemberRepository.saveAll(Arrays.asList(m1, m2, m3, m4));

        // Sample Pending Intents ready to be matched by clicking "Run Matching"
        List<RideIntent> pendingIntents = Arrays.asList(
                RideIntent.builder()
                        .user(rahul)
                        .destination("Coorg (Madikeri)")
                        .travelMode(TravelMode.BIKE)
                        .pace(Pace.MODERATE)
                        .rideDate(thisSunday)
                        .windowStartTime(LocalTime.of(5, 0))
                        .windowEndTime(LocalTime.of(6, 30))
                        .startingArea("Koramangala")
                        .notes("Looking for coffee plantation curves and misty morning ghats.")
                        .status(RideIntentStatus.PENDING)
                        .build(),
                RideIntent.builder()
                        .user(ananya)
                        .destination("Coorg (Madikeri)")
                        .travelMode(TravelMode.BIKE)
                        .pace(Pace.MODERATE)
                        .rideDate(thisSunday)
                        .windowStartTime(LocalTime.of(5, 15))
                        .windowEndTime(LocalTime.of(6, 45))
                        .startingArea("Indiranagar")
                        .notes("Ghats lover! Planning to take NH 75 via Nelamangala & Channarayapatna.")
                        .status(RideIntentStatus.PENDING)
                        .build(),
                RideIntent.builder()
                        .user(sneha)
                        .destination("Coorg (Madikeri)")
                        .travelMode(TravelMode.BIKE)
                        .pace(Pace.MODERATE)
                        .rideDate(thisSunday)
                        .windowStartTime(LocalTime.of(5, 0))
                        .windowEndTime(LocalTime.of(7, 0))
                        .startingArea("Whitefield")
                        .notes("BMW GS rider with saddle bags ready. Prefer steady cruising.")
                        .status(RideIntentStatus.PENDING)
                        .build(),
                RideIntent.builder()
                        .user(rohan)
                        .destination("Coorg (Madikeri)")
                        .travelMode(TravelMode.BIKE)
                        .pace(Pace.MODERATE)
                        .rideDate(thisSunday)
                        .windowStartTime(LocalTime.of(5, 30))
                        .windowEndTime(LocalTime.of(7, 0))
                        .startingArea("Hebbal")
                        .notes("Excited for Coorg curves. Scrambler 400X ready.")
                        .status(RideIntentStatus.PENDING)
                        .build(),
                RideIntent.builder()
                        .user(vikram)
                        .destination("Chikmagalur")
                        .travelMode(TravelMode.CAR)
                        .pace(Pace.MODERATE)
                        .rideDate(thisSaturday)
                        .windowStartTime(LocalTime.of(6, 0))
                        .windowEndTime(LocalTime.of(7, 30))
                        .startingArea("HSR Layout")
                        .notes("Thar 4x4 road trip to Mullayanagiri peak & coffee estates.")
                        .status(RideIntentStatus.PENDING)
                        .build(),
                RideIntent.builder()
                        .user(priya)
                        .destination("Chikmagalur")
                        .travelMode(TravelMode.CAR)
                        .pace(Pace.MODERATE)
                        .rideDate(thisSaturday)
                        .windowStartTime(LocalTime.of(6, 15))
                        .windowEndTime(LocalTime.of(7, 45))
                        .startingArea("Jayanagar")
                        .notes("Creta road trip. Looking for disciplined convoy driving.")
                        .status(RideIntentStatus.PENDING)
                        .build()
        );

        rideIntentRepository.saveAll(pendingIntents);

        logger.info("✅ Database seeded successfully with 6 riders, 1 confirmed Nandi Hills demo group, and 6 pending intents.");
    }
}
