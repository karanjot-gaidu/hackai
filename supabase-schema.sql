-- Enable the pgvector extension for vector storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table to store basic user information
CREATE TABLE users (
    clerk_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_onboarded BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding data table with vector storage
CREATE TABLE onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(clerk_id) ON DELETE CASCADE UNIQUE,
    passion TEXT NOT NULL,
    comfort_level VARCHAR(50) NOT NULL,
    time_available VARCHAR(50) NOT NULL,
    main_goal VARCHAR(100) NOT NULL,
    target_audience TEXT,
    passion_embedding VECTOR(768), -- Gemini embedding dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table for storing additional user data
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(clerk_id) ON DELETE CASCADE,
    selected_niche JSONB,
    voice_style VARCHAR(50),
    content_format VARCHAR(50),
    timezone VARCHAR(50),
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content history table to track user's content creation
CREATE TABLE content_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) REFERENCES users(clerk_id) ON DELETE CASCADE,
    tool_used VARCHAR(100) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    content_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_onboarding_user_id ON onboarding_data(user_id);
CREATE INDEX idx_onboarding_embedding ON onboarding_data USING ivfflat (passion_embedding vector_cosine_ops);
CREATE INDEX idx_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_content_history_user_id ON content_history(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_updated_at BEFORE UPDATE ON onboarding_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (clerk_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (clerk_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own onboarding data" ON onboarding_data
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view own content history" ON content_history
    FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Function to create user profile after Clerk signup
CREATE OR REPLACE FUNCTION create_user_profile(
    p_clerk_id VARCHAR(255),
    p_email VARCHAR(255),
    p_username VARCHAR(50),
    p_full_name VARCHAR(255)
)
RETURNS VARCHAR(255) AS $$
BEGIN
    INSERT INTO users (clerk_id, email, username, full_name)
    VALUES (p_clerk_id, p_email, p_username, p_full_name)
    ON CONFLICT (clerk_id) DO UPDATE SET
        email = EXCLUDED.email,
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        updated_at = NOW()
    RETURNING clerk_id;
    
    RETURN p_clerk_id;
END;
$$ LANGUAGE plpgsql;

-- Function to save onboarding data
CREATE OR REPLACE FUNCTION save_onboarding_data(
    p_user_id VARCHAR(255),
    p_passion TEXT,
    p_comfort_level VARCHAR(50),
    p_time_available VARCHAR(50),
    p_main_goal VARCHAR(100),
    p_target_audience TEXT DEFAULT NULL,
    p_passion_embedding VECTOR(768) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    onboarding_uuid UUID;
BEGIN
    INSERT INTO onboarding_data (
        user_id, passion, comfort_level, time_available, 
        main_goal, target_audience, passion_embedding
    )
    VALUES (
        p_user_id, p_passion, p_comfort_level, p_time_available,
        p_main_goal, p_target_audience, p_passion_embedding
    )
    ON CONFLICT (user_id) DO UPDATE SET
        passion = EXCLUDED.passion,
        comfort_level = EXCLUDED.comfort_level,
        time_available = EXCLUDED.time_available,
        main_goal = EXCLUDED.main_goal,
        target_audience = EXCLUDED.target_audience,
        passion_embedding = EXCLUDED.passion_embedding,
        updated_at = NOW()
    RETURNING id INTO onboarding_uuid;
    
    -- Mark user as onboarded
    UPDATE users 
    SET is_onboarded = TRUE, 
        onboarding_completed_at = NOW(),
        updated_at = NOW()
    WHERE clerk_id = p_user_id;
    
    RETURN onboarding_uuid;
END;
$$ LANGUAGE plpgsql; 