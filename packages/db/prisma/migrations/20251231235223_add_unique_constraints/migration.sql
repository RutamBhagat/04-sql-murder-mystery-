-- CreateIndex
CREATE UNIQUE INDEX "get_fit_now_member_person_id_key" ON "get_fit_now_member"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "person_ssn_key" ON "person"("ssn");

-- CreateIndex
CREATE UNIQUE INDEX "person_license_id_key" ON "person"("license_id");
