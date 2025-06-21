package com.fittracker.util;

public class PasswordEncryptor {
    public static String hash(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public static boolean matches(String password, String hash) {
        return BCrypt.checkpw(password, hash);
    }
}
