package springboot.springboot.database.model;

import javax.mail.*;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.util.Properties;

public class SendEmailUsername {

    public void sendEmail(String name, String email, String passwordpatient) {
        final String username = "hongphuc0835@gmail.com";
        final String password = "joia vkwu vppg pdvu";
        String subject = "Welcome to FPT Health";
        String body = "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: sans-serif;margin: 0;padding: 0; }" +
                ".container { min-width: 500px; font-size: 14px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border: none; border-radius: 4px; box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); }" +
                ".header { background-color: #004B91; color: white; padding: 10px; text-align: center; border-radius: 4px; }" +
                ".content { padding: 20px; }" +
                "strong { color: #004B91}" +
                "li{ list-style: none}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div style='text-align:center; margin-bottom: 10px'>" +
                "<img src='https://i.ibb.co/ztg2nLn/fpt-health-high-resolution-logo-transparent.png' alt='FPT Health Logo' height='80' />" +
                "</div>"+
                "<div class='header'>" +
                "<h2>Welcome to FPT Health</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Hi <strong>" + name + "</strong>,</p>" +
                "<p>To help you manage your medical records, we have created an account for you on the system. You can log in at any time to review your medical records.</p>" +
                "<p>Your account details:</p>" +
                "<ul>" +
                "<li><strong>Username:</strong> " + email + "</li>" +
                "<li><strong>Password:</strong> " + passwordpatient + "</li>" +
                "</ul>" +
                "<p>We recommend logging in to update your password for security reasons. Additionally, you can also log in as Google. Best regards!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";


        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("hongphuc0835@gmail.com"));
            message.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(email));

            message.setSubject(subject);
            message.setContent(body, "text/html; charset=utf-8");
            Transport.send(message);
            System.out.println("Email sent successfully");
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }


    public void sendEmailFormRegister(String doctorName, String departmentName, String medicalDay, String patientEmail, String patientName,String timeSlot) {
        final String username = "hongphuc0835@gmail.com";
        final String password = "joia vkwu vppg pdvu";
        String subject = "Appointment Notification";
        String body = "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: sans-serif;margin: 0;padding: 0; }" +
                ".container { min-width: 500px; font-size: 14px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border: none; border-radius: 4px; box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); }" +
                ".header { background-color: #004B91; color: white; padding: 10px; text-align: center; border-radius: 4px; }" +
                ".content { padding: 20px; }" +
                "strong { color: #004B91 }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div style='text-align:center; margin-bottom: 10px'>" +
                "<img src='https://i.ibb.co/ztg2nLn/fpt-health-high-resolution-logo-transparent.png' alt='FPT Health Logo' height='80' />" +
                "</div>" +
                "<div class='header'>" +
                "<h2>Appointment Notification</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Hi <strong>" + patientName + "</strong>,</p>" +
                "<p>You have successfully booked an appointment at FPT Health.</p>" +
                "<p><strong>Your department:</strong> " + departmentName + "</p>" +
                "<p><strong>Your doctor:</strong> " + doctorName + "</p>" +
                "<p><strong>Your appointment date:</strong> " + medicalDay + "</p>" +
                "<p><strong>Your appointment time:</strong> " + timeSlot + "</p>" +
                "<p>Our staff will contact you to give you detailed instructions. Best regards!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";


        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("hongphuc0835@gmail.com"));
            message.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(patientEmail));
            message.setSubject(subject);
            message.setContent(body, "text/html; charset=utf-8");
            Transport.send(message);

            System.out.println("Email sent successfully");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }


    public static void sendEmailForgot(String name, String email, String code) {
        final String username = "hongphuc0835@gmail.com";
        final String password = "joia vkwu vppg pdvu";
        String subject = "Password Reset Request";
        String body = "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: sans-serif;margin: 0;padding: 0; }" +
                ".container { min-width: 500px; font-size: 14px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border: none; border-radius: 4px; box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); }" +
                ".header { background-color: #004B91; color: white; padding: 10px; text-align: center; border-radius: 4px; }" +
                ".content { padding: 20px; }" +
                "strong { color: #004B91}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div style='text-align:center; margin-bottom: 10px'>" +
                "<img src='https://i.ibb.co/ztg2nLn/fpt-health-high-resolution-logo-transparent.png' alt='FPT Health Logo' height='80' />" +
                "</div>"+
                "<div class='header'>" +
                "<h2>Password Reset Request</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Hi <strong>" + name + "</strong>,</p>" +
                "<p>We have received a request to retrieve your password. For security purposes, please do not share the code below with anyone.</p>" +
                "<p>Your verify code is:</p>" +
                "<h3> " + code + "</h3>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("hongphuc0835@gmail.com"));
            message.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(email));

            message.setSubject(subject);
            message.setContent(body, "text/html; charset=utf-8");

            Transport.send(message);

            System.out.println("Email sent successfully");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
    public void sendEmailReply(String name, String email, String message) {
        final String username = "hongphuc0835@gmail.com";
        final String password = "joia vkwu vppg pdvu";
        String subject = "Feedback Reply";
        String body = "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: sans-serif;margin: 0;padding: 0; }" +
                ".container { min-width: 500px; font-size: 14px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border: none; border-radius: 4px; box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); }" +
                ".header { background-color: #004B91; color: white; padding: 10px; text-align: center; border-radius: 4px; }" +
                ".content { padding: 20px; }" +
                "strong { color: #004B91}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div style='text-align:center; margin-bottom: 10px'>" +
                "<img src='https://i.ibb.co/ztg2nLn/fpt-health-high-resolution-logo-transparent.png' alt='FPT Health Logo' height='80' />" +
                "</div>"+
                "<div class='header'>" +
                "<h2>Thanks for your feedback</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Hi <strong>" + name + "</strong>,</p>" +
                "<p>" + message + "</p>" +
                "<p>Best Regards!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });
        try {
            Message msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress(username));
            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(email));
            msg.setSubject(subject);
            msg.setContent(body, "text/html; charset=utf-8");
            Transport.send(msg);
            System.out.println("Email sent successfully");
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
    public void sendEmailToDoctor(String doctorName, String departmentName, String appointmentDate, String doctorEmail, String patientName, String timeSlot) {
        final String username = "hongphuc0835@gmail.com";
        final String password = "joia vkwu vppg pdvu";
        String subject = "Appointment Notification";
        String body = "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: sans-serif;margin: 0;padding: 0; }" +
                ".container { min-width: 500px; font-size: 14px; margin: 20px auto; padding: 20px; background-color: #f0f0f0; border: none; border-radius: 4px; box-shadow: 0 0 3px rgba(0, 0, 0, 0.3); }" +
                ".header { background-color: #004B91; color: white; padding: 10px; text-align: center; border-radius: 4px; }" +
                ".content { padding: 20px; }" +
                "strong { color: #004B91}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div style='text-align:center; margin-bottom: 10px'>" +
                "<img src='https://i.ibb.co/ztg2nLn/fpt-health-high-resolution-logo-transparent.png' alt='FPT Health Logo' height='80' />" +
                "</div>"+
                "<div class='header'>" +
                "<h2>Appointment Notification</h2>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Hi <strong>" + doctorName + "</strong>,</p>" +
                "<p>You have a new appointment at FPT Health.</p>" +
                "<p><strong>Department:</strong> " + departmentName + "</p>" +
                "<p><strong>Patient:</strong> " + patientName + "</p>" +
                "<p><strong>Your appointment date:</strong> " + appointmentDate + "</p>" +
                "<p><strong>Your appointment time:</strong> " + timeSlot + "</p>" +
                "<p>Please check and prepare. Best regards!</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        Session session = Session.getInstance(props,
                new javax.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress("hongphuc0835@gmail.com"));
            message.setRecipients(Message.RecipientType.TO,
                    InternetAddress.parse(doctorEmail));
            message.setSubject(subject);
            message.setContent(body, "text/html; charset=utf-8");
            Transport.send(message);

            System.out.println("Email sent to doctor successfully");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }


}