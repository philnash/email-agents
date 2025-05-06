import bcrypt from "bcrypt";
import { collections } from "../utils/astra.js";

/**
 * User model backed by Astra DB collection
 */
export default class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's raw password (will be hashed)
   * @param {string} userData.firstName - User's first name
   * @param {string} userData.lastName - User's last name
   * @returns {Promise<Object>} - Newly created user (without password)
   */
  static async create({ email, password, firstName, lastName }) {
    // Input validation
    if (!email || !password || !firstName || !lastName) {
      throw new Error(
        "Required fields missing: email, password, firstName, lastName"
      );
    }

    // Get the users collection
    const users = collections.users;

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document
    const now = new Date();
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      createdAt: now,
      lastLoggedIn: null,
    };

    // Insert user into the database
    await users.insertOne(userData);

    // Return user document without password
    const { password: _, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }

  /**
   * Find a user by email
   * @param {string} email - User's email
   * @returns {Promise<Object|null>} - User document without password or null if not found
   */
  static async findByEmail(email) {
    if (!email) {
      throw new Error("Email is required");
    }

    const users = collections.users;
    const user = await users.findOne(
      { email },
      { projection: { password: false } }
    );

    return user ? user : null;
  }

  /**
   * Authenticate a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object|null>} - User document without password or null if authentication fails
   */
  static async authenticate(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const users = collections.users;
    const user = await users.findOne({ email });

    if (!user) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    // Update lastLoggedIn timestamp
    const now = new Date();
    await users.updateOne({ email }, { $set: { lastLoggedIn: now } });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, lastLoggedIn: now };
  }

  /**
   * Find a user by ID
   * @param {string} id - User's ID
   * @returns {Promise<Object|null>} - User document without password or null if not found
   */
  static async findById(id) {
    if (!id) {
      throw new Error("User ID is required");
    }

    const users = collections.users;
    const user = await users.findOne(
      { _id: id },
      { projection: { password: false } }
    );

    return user ? user : null;
  }

  /**
   * Update a user's information
   * @param {string} id - User's ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} - Updated user without password or null if not found
   */
  static async update(id, updates) {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Don't allow updating these fields directly
    const { email, password, createdAt, _id, ...allowedUpdates } = updates;

    const users = collections.users;

    await users.updateOne({ _id: id }, { $set: allowedUpdates });

    return this.findById(id);
  }

  /**
   * Update a user's password
   * @param {string} id - User's ID
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  static async updatePassword(id, newPassword) {
    if (!id || !newPassword) {
      throw new Error("User ID and new password are required");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const users = collections.users;

    const result = await users.updateOne(
      { _id: id },
      { $set: { password: hashedPassword } }
    );

    return result.modifiedCount === 1;
  }
}
