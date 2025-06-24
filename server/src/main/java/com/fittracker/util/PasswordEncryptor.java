package com.fittracker.util;

import org.springframework.security.crypto.bcrypt.BCrypt;

public class PasswordEncryptor {
    public static String hash(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public static boolean matches(String password, String hash) {
        return BCrypt.checkpw(password, hash);
    }
}
