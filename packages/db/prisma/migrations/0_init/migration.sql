-- CreateTable
CREATE TABLE "crime_scene_report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" INTEGER,
    "type" TEXT,
    "description" TEXT,
    "city" TEXT
);

-- CreateTable
CREATE TABLE "drivers_license" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "age" INTEGER,
    "height" INTEGER,
    "eye_color" TEXT,
    "hair_color" TEXT,
    "gender" TEXT,
    "plate_number" TEXT,
    "car_make" TEXT,
    "car_model" TEXT
);

-- CreateTable
CREATE TABLE "facebook_event_checkin" (
    "person_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "event_name" TEXT,
    "date" INTEGER NOT NULL,

    PRIMARY KEY ("person_id", "event_id", "date"),
    CONSTRAINT "facebook_event_checkin_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "get_fit_now_check_in" (
    "membership_id" TEXT NOT NULL,
    "check_in_date" INTEGER NOT NULL,
    "check_in_time" INTEGER NOT NULL,
    "check_out_time" INTEGER,

    PRIMARY KEY ("membership_id", "check_in_date", "check_in_time"),
    CONSTRAINT "get_fit_now_check_in_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "get_fit_now_member" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "get_fit_now_member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "person_id" INTEGER,
    "name" TEXT,
    "membership_start_date" INTEGER,
    "membership_status" TEXT,
    CONSTRAINT "get_fit_now_member_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "income" (
    "ssn" TEXT NOT NULL PRIMARY KEY,
    "annual_income" INTEGER
);

-- CreateTable
CREATE TABLE "interview" (
    "person_id" INTEGER NOT NULL,
    "transcript" TEXT,
    CONSTRAINT "interview_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "person" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "license_id" INTEGER,
    "address_number" INTEGER,
    "address_street_name" TEXT,
    "ssn" TEXT,
    CONSTRAINT "person_license_id_fkey" FOREIGN KEY ("license_id") REFERENCES "drivers_license" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "person_ssn_fkey" FOREIGN KEY ("ssn") REFERENCES "income" ("ssn") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "solution" (
    "user" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_person_id_key" ON "interview"("person_id");

