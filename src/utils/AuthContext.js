// src/utils/AuthContext.js - Enhanced Version
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    FacebookAuthProvider
} from 'firebase/auth';
import {
    ref,
    get,
    set,
    update,
    serverTimestamp
} from 'firebase/database';
import { auth, database } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        // Check localStorage for existing auth state
        const storedUser = localStorage.getItem('user');
        const storedAuthState = localStorage.getItem('isAuthenticated');
        
        if (storedUser && storedAuthState === 'true') {
            try {
                const userData = JSON.parse(storedUser);
                // Validate stored user data
                if (userData.uid || userData.studentId) {
                    setUser(userData);
                    setIsAuthenticated(true);
                    setLoading(false);
                    console.log('User restored from localStorage:', userData.email);
                    return;
                }
            } catch (error) {
                console.error('Error parsing stored user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
            }
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Auth state changed:', firebaseUser?.uid);

            if (firebaseUser) {
                try {
                    setAuthError(null);
                    // Get user profile from Realtime Database
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    
                    if (userProfile) {
                        // Update last login
                        await updateUserData(firebaseUser.uid, {
                            lastLogin: serverTimestamp(),
                            lastLoginFormatted: new Date().toISOString()
                        });

                        const userData = { 
                            uid: firebaseUser.uid, 
                            email: firebaseUser.email,
                            emailVerified: firebaseUser.emailVerified,
                            ...userProfile,
                            role: userProfile.role || 'student',
                            userType: userProfile.role || 'student'
                        };
                        
                        setUser(userData);
                        setIsAuthenticated(true);
                        
                        // Store in localStorage
                        localStorage.setItem('user', JSON.stringify(userData));
                        localStorage.setItem('isAuthenticated', 'true');

                        console.log('User authenticated from Firebase:', userData);
                    } else {
                        console.log('No user profile found in Realtime Database');
                        // Don't automatically sign out - let user create profile
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            emailVerified: firebaseUser.emailVerified,
                            role: 'student',
                            userType: 'student',
                            needsProfile: true
                        });
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setAuthError(error.message);
                    setUser(null);
                    setIsAuthenticated(false);
                    localStorage.removeItem('user');
                    localStorage.removeItem('isAuthenticated');
                }
            } else {
                console.log('User not authenticated');
                setUser(null);
                setIsAuthenticated(false);
                setAuthError(null);
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getUserProfile = async (uid) => {
        try {
            // First try to get from users collection
            const userRef = ref(database, `users/${uid}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                return snapshot.val();
            }

            // If not found, try to find in studentCredentials by email
            const auth = await import('firebase/auth');
            const currentUser = auth.getAuth().currentUser;
            if (currentUser?.email) {
                const credentialsRef = ref(database, 'studentCredentials');
                const credentialsSnapshot = await get(credentialsRef);
                
                if (credentialsSnapshot.exists()) {
                    const allCredentials = credentialsSnapshot.val();
                    const studentEntry = Object.entries(allCredentials).find(([key, data]) => 
                        data.email === currentUser.email
                    );
                    
                    if (studentEntry) {
                        const [studentId, studentData] = studentEntry;
                        // Convert student data to user profile format
                        return {
                            role: 'student',
                            userType: 'student',
                            studentId: studentId,
                            displayName: [
                                studentData.studentInfo?.firstName || '',
                                studentData.studentInfo?.lastName || ''
                            ],
                            profile: {
                                firstName: studentData.studentInfo?.firstName || '',
                                lastName: studentData.studentInfo?.lastName || '',
                                phone: studentData.studentInfo?.phone || '',
                                email: studentData.email,
                                course: studentData.studentInfo?.course || '',
                                batch: studentData.studentInfo?.batch || '',
                                rollNumber: studentData.studentInfo?.rollNumber || '',
                                admissionDate: studentData.studentInfo?.admissionDate || ''
                            },
                            studentInfo: studentData.studentInfo,
                            isActive: studentData.status === 'active',
                            createdAt: studentData.createdAt || new Date().toISOString()
                        };
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    };

    const updateUserData = async (uid, data) => {
        try {
            const userRef = ref(database, `users/${uid}`);
            await update(userRef, data);
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    };

    const createUserProfile = async (uid, userData) => {
        try {
            const userRef = ref(database, `users/${uid}`);
            const profileData = {
                ...userData,
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                isActive: true
            };
            await set(userRef, profileData);
            return profileData;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    };

    const login = async (credentials) => {
        try {
            console.log('Attempting login for:', credentials.email);
            setLoading(true);
            setAuthError(null);

            const { email, password } = credentials;

            // Sign in with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            console.log('Firebase auth successful:', firebaseUser.uid);

            // Get user profile from Realtime Database
            const userProfile = await getUserProfile(firebaseUser.uid);

            if (!userProfile) {
                // Create a basic profile if it doesn't exist
                const basicProfile = {
                    email: firebaseUser.email,
                    displayName: [firebaseUser.email.split('@')[0], ''],
                    role: 'student',
                    userType: 'student',
                    profile: {
                        firstName: '',
                        lastName: '',
                        phone: '',
                        address: '',
                        dateOfBirth: '',
                        profileImage: ''
                    }
                };

                const createdProfile = await createUserProfile(firebaseUser.uid, basicProfile);
                const userData = { uid: firebaseUser.uid, ...createdProfile };

                console.log('Created new user profile:', userData);
                return { success: true, user: userData };
            }

            // Check if user is active
            if (userProfile.isActive === false) {
                await signOut(auth);
                throw new Error('Your account has been deactivated. Please contact support.');
            }

            const userData = { 
                uid: firebaseUser.uid, 
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                ...userProfile 
            };
            console.log('Login successful with existing profile:', userData);

            return { success: true, user: userData };

        } catch (error) {
            console.error('Login error:', error);
            setAuthError(error.message);

            // Handle specific Firebase auth errors
            let errorMessage = 'Login failed. Please try again.';

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password. Please check your credentials.';
                    break;
                default:
                    errorMessage = error.message || 'An unexpected error occurred.';
            }

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Enhanced Student ID Login Method
    const loginWithStudentId = async (credentials) => {
        try {
            console.log('Attempting student login with ID:', credentials.studentId);
            setLoading(true);
            setAuthError(null);

            const { studentId, password } = credentials;

            // Get student credentials from Realtime Database
            const studentCredRef = ref(database, `studentCredentials/${studentId}`);
            const snapshot = await get(studentCredRef);

            if (!snapshot.exists()) {
                console.log('Student ID not found in database');
                return { 
                    success: false, 
                    error: 'Student ID not found. Please check your credentials.' 
                };
            }

            const studentData = snapshot.val();
            console.log('Student data found:', { 
                studentId, 
                hasPassword: !!studentData.password,
                status: studentData.status 
            });

            // Verify password and status
            if (studentData.password !== password) {
                console.log('Invalid password for student ID');
                return { 
                    success: false, 
                    error: 'Invalid password. Please check your credentials.' 
                };
            }

            if (studentData.status !== 'active') {
                console.log('Student account is not active');
                return { 
                    success: false, 
                    error: 'Your account is not active. Please contact support.' 
                };
            }

            // Create user object for student
            const userData = {
                uid: studentId,
                studentId: studentId,
                role: 'student',
                userType: 'student',
                email: studentData.email,
                isActive: true,
                lastLogin: new Date().toISOString(),
                displayName: [
                    studentData.studentInfo?.firstName || '',
                    studentData.studentInfo?.lastName || ''
                ],
                profile: {
                    firstName: studentData.studentInfo?.firstName || '',
                    lastName: studentData.studentInfo?.lastName || '',
                    phone: studentData.studentInfo?.phone || '',
                    email: studentData.studentInfo?.email || studentData.email,
                    course: studentData.studentInfo?.course || '',
                    batch: studentData.studentInfo?.batch || '',
                    rollNumber: studentData.studentInfo?.rollNumber || '',
                    admissionDate: studentData.studentInfo?.admissionDate || ''
                },
                studentInfo: studentData.studentInfo,
                permissions: ['dashboard', 'profile', 'exam', 'receipt']
            };

            console.log('Student login successful:', userData);

            // Set user state
            setUser(userData);
            setIsAuthenticated(true);

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');

            // Update last login in database
            try {
                await update(studentCredRef, {
                    lastLogin: serverTimestamp(),
                    lastLoginFormatted: new Date().toISOString()
                });
            } catch (updateError) {
                console.warn('Could not update last login:', updateError);
            }

            return { success: true, user: userData };

        } catch (error) {
            console.error('Student login error:', error);
            setAuthError(error.message);
            return { 
                success: false, 
                error: error.message || 'Login failed. Please try again.' 
            };
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        try {
            setLoading(true);
            setAuthError(null);
            console.log('Attempting Google login...');

            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            // Set custom parameters for better UX
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;

            console.log('Google auth successful:', firebaseUser.uid);

            // Check if user profile exists in Realtime Database
            let userProfile = await getUserProfile(firebaseUser.uid);

            if (!userProfile) {
                // Create new user profile using Google data
                const displayNameParts = firebaseUser.displayName ? 
                    firebaseUser.displayName.split(' ') : 
                    [firebaseUser.email.split('@')[0], ''];
                
                const newUserProfile = {
                    email: firebaseUser.email,
                    displayName: displayNameParts,
                    role: 'student',
                    userType: 'student',
                    authProvider: 'google',
                    profile: {
                        firstName: displayNameParts[0] || '',
                        lastName: displayNameParts.slice(1).join(' ') || '',
                        phone: '',
                        address: '',
                        dateOfBirth: '',
                        profileImage: firebaseUser.photoURL || ''
                    }
                };

                const createdProfile = await createUserProfile(firebaseUser.uid, newUserProfile);
                const userData = { 
                    uid: firebaseUser.uid, 
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    ...createdProfile 
                };

                console.log('Created new Google user profile:', userData);
                return { success: true, user: userData };
            } else {
                // Update last login for existing user
                await updateUserData(firebaseUser.uid, {
                    lastLogin: serverTimestamp(),
                    lastLoginFormatted: new Date().toISOString()
                });
            }

            const userData = { 
                uid: firebaseUser.uid, 
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                ...userProfile 
            };
            console.log('Google login successful:', userData);

            return { success: true, user: userData };

        } catch (error) {
            console.error('Google login error:', error);
            setAuthError(error.message);
            
            let errorMessage = 'Google login failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Google login was cancelled.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup blocked. Please allow popups for this site.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with this email using a different login method.';
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const loginWithFacebook = async () => {
        try {
            setLoading(true);
            setAuthError(null);
            console.log('Attempting Facebook login...');

            const provider = new FacebookAuthProvider();
            provider.addScope('email');
            provider.addScope('public_profile');
            
            const userCredential = await signInWithPopup(auth, provider);
            const firebaseUser = userCredential.user;

            console.log('Facebook auth successful:', firebaseUser.uid);

            // Check if user profile exists
            let userProfile = await getUserProfile(firebaseUser.uid);

            if (!userProfile) {
                const displayNameParts = firebaseUser.displayName ? 
                    firebaseUser.displayName.split(' ') : 
                    [firebaseUser.email?.split('@')[0] || 'User', ''];
                
                const newUserProfile = {
                    email: firebaseUser.email || '',
                    displayName: displayNameParts,
                    role: 'student',
                    userType: 'student',
                    authProvider: 'facebook',
                    profile: {
                        firstName: displayNameParts[0] || '',
                        lastName: displayNameParts.slice(1).join(' ') || '',
                        phone: '',
                        address: '',
                        dateOfBirth: '',
                        profileImage: firebaseUser.photoURL || ''
                    }
                };

                const createdProfile = await createUserProfile(firebaseUser.uid, newUserProfile);
                const userData = { 
                    uid: firebaseUser.uid, 
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    ...createdProfile 
                };

                return { success: true, user: userData };
            }

            // Update existing user
            await updateUserData(firebaseUser.uid, {
                lastLogin: serverTimestamp(),
                lastLoginFormatted: new Date().toISOString()
            });

            const userData = { 
                uid: firebaseUser.uid, 
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                ...userProfile 
            };
            
            return { success: true, user: userData };

        } catch (error) {
            console.error('Facebook login error:', error);
            setAuthError(error.message);
            
            let errorMessage = 'Facebook login failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Facebook login was cancelled.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with this email using a different login method.';
            }
            
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            setAuthError(null);
            console.log('Attempting registration for:', userData.email);

            const { email, password, firstName, lastName, phone } = userData;

            // Create user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            console.log('Firebase registration successful:', firebaseUser.uid);

            // Create user profile in Realtime Database
            const userProfile = {
                email: firebaseUser.email,
                displayName: [firstName || '', lastName || ''],
                role: 'student',
                userType: 'student',
                authProvider: 'email',
                profile: {
                    firstName: firstName || '',
                    lastName: lastName || '',
                    phone: phone || '',
                    address: '',
                    dateOfBirth: '',
                    profileImage: ''
                }
            };

            const createdProfile = await createUserProfile(firebaseUser.uid, userProfile);
            const newUserData = { 
                uid: firebaseUser.uid, 
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                ...createdProfile 
            };
            
            console.log('Registration successful:', newUserData);

            return { success: true, user: newUserData };

        } catch (error) {
            console.error('Registration error:', error);
            setAuthError(error.message);

            let errorMessage = 'Registration failed. Please try again.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address format.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email/password accounts are not enabled.';
                    break;
                default:
                    errorMessage = error.message || 'An unexpected error occurred.';
            }

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            console.log('Logging out user...');
            
            // Clear localStorage first
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            
            // Reset state
            setUser(null);
            setIsAuthenticated(false);
            setAuthError(null);
            
            // Sign out from Firebase Auth if user was signed in with Firebase
            if (auth.currentUser) {
                await signOut(auth);
            }
            
            console.log('Logout successful');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if Firebase signOut fails, we still want to clear local state
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            setUser(null);
            setIsAuthenticated(false);
            setAuthError(null);
            
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        if (!user) return { success: false, error: 'No user logged in' };

        try {
            setAuthError(null);
            
            // For student users, update their student credentials
            if (user.role === 'student' && user.studentId) {
                const studentCredRef = ref(database, `studentCredentials/${user.studentId}/studentInfo`);
                await update(studentCredRef, updates);
            } else if (user.uid) {
                // For regular users, update their profile
                const profileUpdates = {
                    profile: { ...user.profile, ...updates },
                    updatedAt: serverTimestamp(),
                    updatedAtFormatted: new Date().toISOString()
                };
                await updateUserData(user.uid, profileUpdates);
            }

            const updatedUser = { 
                ...user, 
                profile: { ...user.profile, ...updates }
            };
            setUser(updatedUser);
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Update profile error:', error);
            setAuthError(error.message);
            return { success: false, error: error.message };
        }
    };

    const refreshUserProfile = async () => {
        if (!user?.uid) return;

        try {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                const updatedUser = { 
                    ...user, 
                    ...userProfile,
                    email: user.email,
                    emailVerified: user.emailVerified
                };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Error refreshing user profile:', error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        authError,
        login,
        loginWithStudentId,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
        updateProfile,
        refreshUserProfile,
        getUserProfile,
        // Aliases for compatibility
        currentUser: user,
        userRole: user?.role || null,
        userType: user?.userType || user?.role || null
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
