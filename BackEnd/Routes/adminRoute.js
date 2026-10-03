const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Admin = require("../Model/adminModel");
const User = require("../Model/model");
const adminMiddleware = require("../Middleware/adminMiddleware");
const router = express.Router();

// ADMIN REGISTER

router.post("/register", async (req, res) => {
    try {

        const { adminName, email, password } = req.body;

        if (!adminName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            adminName,
            email,
            password: hashedPassword
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: "Admin registered successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
});

// ADMIN LOGIN

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {

            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });

        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {

            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });

        }

        const token = jwt.sign(

            {
                id: admin._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );

        res.status(200).json({

            success: true,
            message: "Login Successful",
            token

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});

// GET ADMIN PROFILE

router.get("/profile", adminMiddleware, async (req, res) => {

    try {

        const admin = await Admin.findById(req.admin.id).select("-password");

        res.status(200).json({

            success: true,
            admin

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});

// UPDATE ADMIN PROFILE

router.put("/profile", adminMiddleware, async (req, res) => {

    try {

        const { adminName, email, password } = req.body;

        const updateData = {};

        if (adminName) {
            updateData.adminName = adminName;
        }

        if (email) {
            updateData.email = email;
        }

        if (password) {

            updateData.password = await bcrypt.hash(password, 10);

        }

        const updatedAdmin = await Admin.findByIdAndUpdate(

            req.admin.id,

            updateData,

            { returnDocument: "after" }

        ).select("-password");

        res.status(200).json({

            success: true,
            message: "Profile Updated Successfully",
            admin: updatedAdmin

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

});

// GET ALL REGISTERED USERS FROM MONGODB
router.get("/users", adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password");
        
        // Ensure every user has status and habits initialized if empty
        const formattedUsers = users.map(userObj => {
            const u = userObj.toObject();
            if (!u.status) u.status = "active";
            if (!u.habits) u.habits = [];
            return u;
        });

        res.status(200).json({
            success: true,
            users: formattedUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error fetching registered users"
        });
    }
});

// UPDATE USER STATUS (BLOCK / UNBLOCK)
router.patch("/users/:id/status", adminMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        user.status = status || (user.status === "active" ? "blocked" : "active");
        await user.save();

        res.status(200).json({
            success: true,
            message: `User status updated to ${user.status}`,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error updating user status" });
    }
});

// DELETE REGISTERED USER
router.delete("/users/:id", adminMiddleware, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error deleting user" });
    }
});

// DELETE INAPPROPRIATE HABIT
router.delete("/users/:userId/habits/:habitId", adminMiddleware, async (req, res) => {
    try {
        const { userId, habitId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.habits = (user.habits || []).filter(h => (h.id || h._id.toString()) !== habitId);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Habit deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error deleting habit" });
    }
});

// SEND EMAIL TO USER USING NODEMAILER
router.post("/send-email", adminMiddleware, async (req, res) => {
    try {
        const { to, subject, message, activitySummary } = req.body;

        if (!to || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Recipient email, subject, and message content are required."
            });
        }

        // Fetch logged-in admin email
        const admin = await Admin.findById(req.admin.id);
        const adminEmail = admin ? admin.email : "admin@habitflow.com";
        const adminName = admin ? admin.adminName : "HabitFlow Admin";

        // Create transporter using Nodemailer test account (Ethereal) or SMTP settings
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.ethereal.email",
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || testAccount.user,
                pass: process.env.SMTP_PASS || testAccount.pass,
            },
        });

        const htmlContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 2rem; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <h1 style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; font-size: 28px;">HabitFlow</h1>
                <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Official Admin Communication</p>
            </div>
            
            <div style="background: rgba(30, 41, 59, 0.8); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem;">
                <h3 style="color: #6366f1; margin-top: 0;">Notice from ${adminName} (${adminEmail})</h3>
                <p style="line-height: 1.6; color: #e2e8f0; font-size: 15px;">${message.replace(/\n/g, '<br/>')}</p>
            </div>

            ${activitySummary ? `
            <div style="background: rgba(99, 102, 241, 0.1); padding: 1.2rem; border-radius: 8px; border-left: 4px solid #6366f1; margin-bottom: 1.5rem;">
                <h4 style="color: #818cf8; margin-top: 0; margin-bottom: 8px;">📊 Habit Activity Snapshot</h4>
                <p style="line-height: 1.5; color: #cbd5e1; font-size: 14px; margin: 0;">${activitySummary.replace(/\n/g, '<br/>')}</p>
            </div>
            ` : ''}

            <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; color: #64748b; font-size: 12px;">
                <p>Sent via HabitFlow Admin Portal by <strong>${adminName}</strong></p>
                <p>&copy; ${new Date().getFullYear()} HabitFlow. All rights reserved.</p>
            </div>
        </div>
        `;

        let info = await transporter.sendMail({
            from: `"${adminName}" <${adminEmail}>`,
            to: to,
            subject: subject,
            text: message,
            html: htmlContent,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);

        res.status(200).json({
            success: true,
            message: `Email sent successfully to ${to}`,
            messageId: info.messageId,
            previewUrl: previewUrl || null
        });

    } catch (error) {
        console.error("Nodemailer error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send email: " + error.message
        });
    }
});

module.exports = router;