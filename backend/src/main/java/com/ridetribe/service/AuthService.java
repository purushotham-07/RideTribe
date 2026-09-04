package com.ridetribe.service;

import com.ridetribe.dto.*;
import com.ridetribe.model.TravelMode;
import com.ridetribe.model.User;
import com.ridetribe.repository.UserRepository;
import com.ridetribe.security.JwtUtils;
import com.ridetribe.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already registered!");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .gender(request.getGender() != null ? request.getGender() : "MALE")
                .age(request.getAge() != null ? request.getAge() : 25)
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : 
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
                .preferredMode(request.getPreferredMode() != null ? request.getPreferredMode() : TravelMode.BIKE)
                .vehicleModel(request.getVehicleModel())
                .vehicleNumber(request.getVehicleNumber())
                .vehiclePhotoUrl(request.getVehiclePhotoUrl())
                .emergencyContactName(request.getEmergencyContactName())
                .emergencyContactPhone(request.getEmergencyContactPhone())
                .bio(request.getBio())
                .avgRating(5.0)
                .totalRatings(0)
                .ridesCompleted(0)
                .build();

        User saved = userRepository.save(user);

        String jwt = jwtUtils.generateTokenFromEmail(saved.getEmail());

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(UserDTO.fromEntity(saved))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(UserDTO.fromEntity(user))
                .build();
    }

    public AuthResponse googleAuth(String email, String name, String avatarUrl) {
        Optional<User> existing = userRepository.findByEmail(email);
        User user;
        if (existing.isPresent()) {
            user = existing.get();
            if (avatarUrl != null && (user.getAvatarUrl() == null || user.getAvatarUrl().contains("unsplash") || user.getAvatarUrl().contains("dicebear"))) {
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
            }
        } else {
            user = User.builder()
                    .name(name != null ? name : "Google Rider")
                    .email(email)
                    .passwordHash(passwordEncoder.encode("google-oauth-user-" + System.currentTimeMillis()))
                    .avatarUrl(avatarUrl != null ? avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150")
                    .preferredMode(TravelMode.BIKE)
                    .gender("MALE")
                    .age(25)
                    .avgRating(5.0)
                    .totalRatings(0)
                    .ridesCompleted(0)
                    .build();
            user = userRepository.save(user);
        }

        String jwt = jwtUtils.generateTokenFromEmail(user.getEmail());
        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .user(UserDTO.fromEntity(user))
                .build();
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("No authenticated user in context");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public UserDTO updateProfile(String userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getPreferredMode() != null) user.setPreferredMode(request.getPreferredMode());
        if (request.getVehicleModel() != null) user.setVehicleModel(request.getVehicleModel());
        if (request.getVehicleNumber() != null) user.setVehicleNumber(request.getVehicleNumber());
        if (request.getVehiclePhotoUrl() != null) user.setVehiclePhotoUrl(request.getVehiclePhotoUrl());
        if (request.getEmergencyContactName() != null) user.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        if (request.getBio() != null) user.setBio(request.getBio());

        return UserDTO.fromEntity(userRepository.save(user));
    }
}
