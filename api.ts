import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';
import { User, UserRole, ClassType, LessonSession, Package, Purchase, Availability, Blockout, StudentProgress } from './types';

export const api = {
    // --- USERS ---
    async getUsers(): Promise<User[]> {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            email: p.email,
            name: p.full_name,
            role: p.role as UserRole,
            avatarUrl: p.avatar_url,
            packageCredits: p.package_credits
        }));
    },

    async getUserById(id: string): Promise<User | undefined> {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
        if (error) return undefined;
        return {
            id: data.id,
            email: data.email,
            name: data.full_name,
            role: data.role as UserRole,
            avatarUrl: data.avatar_url,
            packageCredits: data.package_credits
        };
    },

    async updateUser(user: Partial<User> & { id: string }) {
        const updates: any = {};
        if (user.name) updates.full_name = user.name;
        if (user.role) updates.role = user.role;
        if (user.packageCredits !== undefined) updates.package_credits = user.packageCredits;

        const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
        if (error) throw error;
    },

    async createUser(user: User, password?: string) {
        if (!password) throw new Error("Password is required to create a user");

        // Create a temporary client to avoid logging out the current admin
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const tempClient = createClient(supabaseUrl, supabaseAnonKey);

        const { data, error } = await tempClient.auth.signUp({
            email: user.email,
            password: password,
            options: {
                data: {
                    full_name: user.name,
                    role: user.role,
                    avatar_url: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`
                }
            }
        });

        if (error) {
            console.error('Error creating user:', error);
            throw error;
        }

        // If auto-confirm is off, the user might not appear in profiles immediately until they confirm email.
        // But usually triggers handle it.
        return data.user;
    },

    async deleteUser(id: string) {
        // NOTE: This only deletes the public profile. The Auth account remains.
        // To delete Auth accounts, you need a Supabase Edge Function with Service Role.
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
            console.error('Error deleting user profile:', error);
            throw error;
        }
    },

    // --- AUTH ---
    async signUp(email: string, password: string, fullName: string, role: UserRole = UserRole.CLIENT) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                    avatar_url: `https://ui-avatars.com/api/?name=${fullName}&background=random`
                }
            }
        });
        if (error) throw error;
        return data.user;
    },

    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data.user;
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role as UserRole,
            avatarUrl: profile.avatar_url,
            packageCredits: profile.package_credits
        };
    },

    // --- CLASSES ---
    async getClasses(): Promise<ClassType[]> {
        const { data, error } = await supabase.from('class_types').select('*');
        if (error) throw error;
        return data.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            durationMinutes: c.duration_minutes,
            priceSingle: c.price,
            pricePackage: c.price_package || c.price, // Fallback if column missing
            difficulty: c.difficulty || 'Beginner',
            capacity: c.capacity
        }));
    },

    async createClass(cls: ClassType) {
        const { error } = await supabase.from('class_types').insert({
            name: cls.name,
            description: cls.description,
            duration_minutes: cls.durationMinutes,
            capacity: cls.capacity || 10,
            price: cls.priceSingle,
            price_package: cls.pricePackage,
            difficulty: cls.difficulty
        });
        if (error) {
            console.error('Error creating class:', error);
            throw error;
        }
    },

    async updateClass(cls: ClassType) {
        const { error } = await supabase.from('class_types').update({
            name: cls.name,
            description: cls.description,
            duration_minutes: cls.durationMinutes,
            price: cls.priceSingle,
            price_package: cls.pricePackage,
            difficulty: cls.difficulty
        }).eq('id', cls.id);
        if (error) {
            console.error('Error updating class:', error);
            throw error;
        }
    },

    async deleteClass(id: string) {
        const { error } = await supabase.from('class_types').delete().eq('id', id);
        if (error) throw error;
    },

    // --- SESSIONS ---
    async getSessions(): Promise<LessonSession[]> {
        const { data, error } = await supabase
            .from('sessions')
            .select(`
        *,
        enrollments (user_id)
      `);

        if (error) throw error;

        return data.map(s => ({
            id: s.id,
            classTypeId: s.class_type_id,
            instructorId: s.instructor_id,
            startTime: s.start_time,
            endTime: s.end_time,
            capacity: s.capacity,
            enrolledUserIds: s.enrollments.map((e: any) => e.user_id)
        }));
    },

    async getSessionsForUser(userId: string): Promise<LessonSession[]> {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
        session:sessions (
          *,
          enrollments (user_id)
        )
      `)
            .eq('user_id', userId);

        if (error) throw error;

        return data.map((item: any) => {
            const s = item.session;
            return {
                id: s.id,
                classTypeId: s.class_type_id,
                instructorId: s.instructor_id,
                startTime: s.start_time,
                endTime: s.end_time,
                capacity: s.capacity,
                enrolledUserIds: s.enrollments.map((e: any) => e.user_id)
            };
        });
    },

    async bookSession(sessionId: string, userId: string) {
        const { error } = await supabase.from('enrollments').insert({
            session_id: sessionId,
            user_id: userId
        });
        if (error) throw error;
    },

    async createSession(session: Partial<LessonSession> & { recurringGroupId?: string }) {
        const { error } = await supabase.from('sessions').insert({
            class_type_id: session.classTypeId,
            instructor_id: session.instructorId,
            start_time: session.startTime,
            end_time: session.endTime,
            capacity: session.capacity,
            recurring_group_id: session.recurringGroupId
        });
        if (error) throw error;
    },

    async createSessions(sessions: (Partial<LessonSession> & { recurringGroupId?: string })[]) {
        const { error } = await supabase.from('sessions').insert(
            sessions.map(s => ({
                class_type_id: s.classTypeId,
                instructor_id: s.instructorId,
                start_time: s.startTime,
                end_time: s.endTime,
                capacity: s.capacity,
                recurring_group_id: s.recurringGroupId
            }))
        );
        if (error) throw error;
    },

    async deleteSession(id: string) {
        const { error } = await supabase.from('sessions').delete().eq('id', id);
        if (error) throw error;
    },

    // --- PACKAGES ---
    async getPackages(): Promise<Package[]> {
        const { data, error } = await supabase.from('packages').select('*');
        if (error) throw error;
        return data.map(p => ({
            id: p.id,
            name: p.name,
            credits: p.credits,
            price: p.price,
            description: p.description
        }));
    },

    async createPackage(pkg: Package) {
        const { error } = await supabase.from('packages').insert({
            name: pkg.name,
            credits: pkg.credits,
            price: pkg.price,
            description: pkg.description
        });
        if (error) {
            console.error('Error creating package:', error);
            throw error;
        }
    },

    async updatePackage(pkg: Package) {
        const { error } = await supabase.from('packages').update({
            name: pkg.name,
            credits: pkg.credits,
            price: pkg.price,
            description: pkg.description
        }).eq('id', pkg.id);
        if (error) throw error;
    },

    async deletePackage(id: string) {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) throw error;
    },

    async purchasePackage(userId: string, packageId: string) {
        // 1. Get package details
        const { data: pkg, error: pkgError } = await supabase.from('packages').select('*').eq('id', packageId).single();
        if (pkgError) throw pkgError;

        // 2. Record purchase
        const { error: purchaseError } = await supabase.from('purchases').insert({
            user_id: userId,
            package_id: packageId,
            amount_paid: pkg.price,
            credits_purchased: pkg.credits
        });
        if (purchaseError) throw purchaseError;

        // 3. Update user credits (RPC call or manual update)
        // For simplicity, fetching current credits and adding
        const { data: profile } = await supabase.from('profiles').select('package_credits').eq('id', userId).single();
        const newCredits = (profile?.package_credits || 0) + pkg.credits;

        const { error: updateError } = await supabase.from('profiles').update({ package_credits: newCredits }).eq('id', userId);
        if (updateError) throw updateError;
    },

    async getPurchases(userId: string): Promise<Purchase[]> {
        const { data, error } = await supabase.from('purchases').select('*, package:packages(*)').eq('user_id', userId);
        if (error) throw error;

        return data.map(p => ({
            id: p.id,
            userId: p.user_id,
            packageId: p.package_id,
            packageName: p.package.name,
            date: p.purchase_date,
            price: p.amount_paid,
            credits: p.credits_purchased
        }));
    },

    async getAllPurchases(): Promise<Purchase[]> {
        const { data, error } = await supabase.from('purchases').select('*, package:packages(*)').order('purchase_date', { ascending: false });
        if (error) throw error;

        return data.map(p => ({
            id: p.id,
            userId: p.user_id,
            packageId: p.package_id,
            packageName: p.package?.name || 'Unknown Package',
            date: p.purchase_date,
            price: p.amount_paid,
            credits: p.credits_purchased
        }));
    },

    // --- AVAILABILITY ---
    async getAvailability(instructorId: string): Promise<Availability[]> {
        const { data, error } = await supabase.from('availability').select('*').eq('instructor_id', instructorId);
        if (error) throw error;
        return data.map(a => ({
            id: a.id,
            instructorId: a.instructor_id,
            dayOfWeek: a.day_of_week,
            startTime: a.start_time,
            endTime: a.end_time
        }));
    },

    async createAvailability(avail: Availability) {
        const { error } = await supabase.from('availability').insert({
            instructor_id: avail.instructorId,
            day_of_week: avail.dayOfWeek,
            start_time: avail.startTime,
            end_time: avail.endTime
        });
        if (error) throw error;
    },

    async deleteAvailability(id: string) {
        const { error } = await supabase.from('availability').delete().eq('id', id);
        if (error) throw error;
    },

    // --- BLOCKOUTS ---
    async getBlockouts(instructorId: string): Promise<Blockout[]> {
        const { data, error } = await supabase.from('blockouts').select('*').eq('instructor_id', instructorId);
        if (error) throw error;
        return data.map(b => ({
            id: b.id,
            instructorId: b.instructor_id,
            date: b.date,
            startTime: b.start_time,
            endTime: b.end_time,
            reason: b.reason
        }));
    },

    async createBlockout(blockout: Blockout) {
        const { error } = await supabase.from('blockouts').insert({
            instructor_id: blockout.instructorId,
            date: blockout.date,
            start_time: blockout.startTime,
            end_time: blockout.endTime,
            reason: blockout.reason
        });
        if (error) throw error;
    },

    async deleteBlockout(id: string) {
        const { error } = await supabase.from('blockouts').delete().eq('id', id);
        if (error) throw error;
    },

    // --- PROGRESS ---
    async getProgress(studentId: string): Promise<any[]> {
        const { data, error } = await supabase.from('student_progress').select('*').eq('student_id', studentId);
        if (error) throw error;
        return data;
    },

    async updateProgress(studentId: string, skillId: string, status: any) {
        const { error } = await supabase.from('student_progress').upsert({
            student_id: studentId,
            skill_id: skillId,
            status: status,
            updated_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    // --- SETTINGS ---
    async getSettings() {
        const { data, error } = await supabase.from('system_settings').select('*').single();
        if (error) return null;
        return data;
    },

    async saveSettings(settings: any) {
        // Upsert settings (assuming single row with ID 1 or similar)
        const { error } = await supabase.from('system_settings').upsert({
            id: 1,
            ...settings
        });
        if (error) throw error;
    }
};
