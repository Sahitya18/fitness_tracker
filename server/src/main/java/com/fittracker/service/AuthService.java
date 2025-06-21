package com.fittracker.service;

@Service
public class AuthService {
    @Autowired UserRepository repo;
    @Autowired OTPService otpService;

    public ResponseEntity<?> register(RegisterRequest req) {
        if (!otpService.verifyOtp(req.getEmail(), req.getOtp()))
            return ResponseEntity.status(403).body("Invalid OTP");

        User user = new User();
        user.setEmail(req.getEmail());
        user.setMobile(req.getMobile());
        user.setPasswordHash(PasswordEncryptor.hash(req.getPassword()));
        user.setVerified(true);
        repo.save(user);
        return ResponseEntity.ok("Registered");
    }

    public ResponseEntity<?> sendOtp(RegisterRequest req) {
        otpService.sendOtp(req.getEmail()); // implement SMS/email
        return ResponseEntity.ok("OTP sent");
    }

    public ResponseEntity<?> login(LoginRequest req) {
        Optional<User> u = repo.findByEmail(req.getEmail());
        if (u.isPresent() && PasswordEncryptor.matches(req.getPassword(), u.get().getPasswordHash()))
            return ResponseEntity.ok("Login success");
        return ResponseEntity.status(401).body("Login failed");
    }

    public ResponseEntity<?> forgotPassword(ForgotPasswordRequest req) {
        if (!otpService.verifyOtp(req.getEmail(), req.getOtp()))
            return ResponseEntity.status(403).body("Invalid OTP");

        User user = repo.findByEmail(req.getEmail()).orElseThrow();
        user.setPasswordHash(PasswordEncryptor.hash(req.getNewPassword()));
        repo.save(user);
        return ResponseEntity.ok("Password reset");
    }
}
