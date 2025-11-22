DROP TABLE IF EXISTS attendance_records CASCADE;

DROP TABLE IF EXISTS attendance_lists CASCADE;

DROP TABLE IF EXISTS professionals CASCADE;

CREATE TABLE professionals (

id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

code TEXT UNIQUE NOT NULL,

registration_code TEXT UNIQUE,

name TEXT NOT NULL,

email TEXT UNIQUE NOT NULL,

profession TEXT NOT NULL,

company TEXT NOT NULL,

created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

CREATE TABLE attendance_lists (

id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

installation_name TEXT NOT NULL,

meeting_date DATE NOT NULL,

meeting_time TIME NOT NULL,

duration TEXT,

course_title TEXT NOT NULL,

course_content TEXT NOT NULL,

instructor_name TEXT NOT NULL,

instructor_role TEXT NOT NULL,

instructor_qualification TEXT NOT NULL,

location TEXT NOT NULL,

start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

end_time TIMESTAMP WITH TIME ZONE,

status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),

created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

CREATE TABLE attendance_records (

id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

list_id UUID REFERENCES attendance_lists(id) ON DELETE CASCADE,

professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,

entry_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

local TEXT NOT NULL,

row_number INTEGER NOT NULL,

created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

);

CREATE INDEX idx_professionals_code ON professionals(code);

CREATE INDEX idx_professionals_email ON professionals(email);

CREATE INDEX idx_professionals_registration_code ON professionals(registration_code);

CREATE INDEX idx_attendance_lists_status ON attendance_lists(status);

CREATE INDEX idx_attendance_records_list_id ON attendance_records(list_id);

CREATE INDEX idx_attendance_records_professional_id ON attendance_records(professional_id);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

ALTER TABLE attendance_lists ENABLE ROW LEVEL SECURITY;

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for professionals" ON professionals FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for attendance_lists" ON attendance_lists FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for attendance_records" ON attendance_records FOR ALL USING (true) WITH CHECK (true);
