-- CreateEnum
CREATE TYPE "PlatformEmployeeRole" AS ENUM ('PR_OUTREACH', 'ADMIN', 'SUPPORT', 'COMPLIANCE_MANAGER', 'REVIEWER');

-- CreateEnum
CREATE TYPE "PlatformEmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "InvitationTargetType" AS ENUM ('CLINIC', 'ADVERTISER');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('INVITED', 'OTP_VERIFIED', 'SIGNED_UP', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClinicStatus" AS ENUM ('PENDING_VERIFICATION', 'APPROVED', 'MOU_PENDING', 'MOU_SIGNED', 'ONBOARDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- CreateEnum
CREATE TYPE "ClinicPhotoType" AS ENUM ('ENTRANCE', 'RECEPTION', 'INSTALLATION_PROOF', 'OTHER');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('PENDING_VERIFICATION', 'APPROVED', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AdvertiserStatus" AS ENUM ('PENDING_VERIFICATION', 'APPROVED');

-- CreateEnum
CREATE TYPE "MouStatus" AS ENUM ('PENDING', 'MOU_PENDING', 'MOU_SIGNED');

-- CreateEnum
CREATE TYPE "InstallationRequestStatus" AS ENUM ('REQUESTED', 'TIME_SUBMITTED');

-- CreateEnum
CREATE TYPE "InstallationTestStatus" AS ENUM ('NOT_TESTED', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "InstallationAssignmentStatus" AS ENUM ('ASSIGNED', 'INSTALLATION_STARTED', 'TEST_PENDING', 'COMPLETION_PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InstallationOtpStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DevicePairingStatus" AS ENUM ('PENDING_PAIRING', 'LINKED', 'PROVISIONED');

-- CreateEnum
CREATE TYPE "AdvertisementModerationStatus" AS ENUM ('SUBMITTED', 'AUTO_REJECTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdvertisementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHING', 'ENCODING', 'ENCODING_FAILED', 'LIVE');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('VOUCHER_CODE', 'LEAD_FORM');

-- CreateEnum
CREATE TYPE "ModerationSource" AS ENUM ('AUTO', 'HUMAN');

-- CreateEnum
CREATE TYPE "ModerationDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EncodingJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETE', 'ERROR');

-- CreateEnum
CREATE TYPE "PlayCompletionStatus" AS ENUM ('FULL', 'PARTIAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'FUNDED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "platform_employees" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "role" "PlatformEmployeeRole" NOT NULL,
    "photoUrl" TEXT,
    "aadharNumberEncrypted" TEXT,
    "status" "PlatformEmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "targetType" "InvitationTargetType" NOT NULL,
    "contactName" TEXT NOT NULL,
    "organisationName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "otpCodeHash" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "status" "InvitationStatus" NOT NULL DEFAULT 'INVITED',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signedUpAt" TIMESTAMP(3),

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT,
    "clinicName" TEXT NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "designation" TEXT,
    "medicalRegistrationNumber" TEXT NOT NULL,
    "establishmentYear" INTEGER,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "clinicLicenseNumber" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "openingTime" TIMESTAMP(3),
    "closingTime" TIMESTAMP(3),
    "status" "ClinicStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_specialities" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,

    CONSTRAINT "clinic_specialities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_working_days" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,

    CONSTRAINT "clinic_working_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_sessions" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_photos" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "photoType" "ClinicPhotoType" NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "ownerName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "address" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "VendorStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_allocated_clinics" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "allocatedBy" TEXT,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_allocated_clinics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_downtime" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_downtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisers" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT,
    "companyName" TEXT NOT NULL,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "businessSector" TEXT,
    "website" TEXT,
    "keyPersonName" TEXT NOT NULL,
    "designation" TEXT,
    "mobileNumber" TEXT NOT NULL,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "status" "AdvertiserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mous" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "doctorSignedAt" TIMESTAMP(3),
    "complianceManagerId" TEXT,
    "complianceSignedAt" TIMESTAMP(3),
    "status" "MouStatus" NOT NULL DEFAULT 'PENDING',
    "signedDocUrl" TEXT,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mous_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installation_requests" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "preferredDate" TIMESTAMP(3),
    "preferredTimeSlot" TEXT,
    "status" "InstallationRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "installation_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installation_assignments" (
    "id" TEXT NOT NULL,
    "installationRequestId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "supportContactNumber" TEXT NOT NULL,
    "testStatus" "InstallationTestStatus" NOT NULL DEFAULT 'NOT_TESTED',
    "testedAt" TIMESTAMP(3),
    "status" "InstallationAssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "installation_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installation_otps" (
    "id" TEXT NOT NULL,
    "installationAssignmentId" TEXT NOT NULL,
    "otpCodeHash" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentToMobile" TEXT NOT NULL,
    "completionPhotoUrl" TEXT,
    "confirmedByVendorId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "status" "InstallationOtpStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "installation_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "pairingCode" TEXT,
    "pairingStatus" "DevicePairingStatus" NOT NULL DEFAULT 'PENDING_PAIRING',
    "certSerial" TEXT,
    "certNotAfter" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ad_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 26,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "pricingPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rawAssetUrl" TEXT NOT NULL,
    "encodedUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "moderationStatus" "AdvertisementModerationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "status" "AdvertisementStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_vouchers" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "voucherType" "VoucherType" NOT NULL,
    "voucherCode" TEXT,
    "formFields" JSONB,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_results" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "source" "ModerationSource" NOT NULL,
    "decision" "ModerationDecision" NOT NULL,
    "confidenceScores" JSONB,
    "reviewerId" TEXT,
    "reason" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encoding_jobs" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "mediaconvertJobId" TEXT,
    "status" "EncodingJobStatus" NOT NULL DEFAULT 'QUEUED',
    "outputUrls" JSONB,
    "errorReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "encoding_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "playDate" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_clinic_exposure" (
    "advertisementId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "timesShown" INTEGER NOT NULL DEFAULT 0,
    "lastShownAt" TIMESTAMP(3),

    CONSTRAINT "ad_clinic_exposure_pkey" PRIMARY KEY ("advertisementId","clinicId")
);

-- CreateTable
CREATE TABLE "play_logs" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "completionStatus" "PlayCompletionStatus" NOT NULL,

    CONSTRAINT "play_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "advertisementId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gatewayRef" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_exports" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "dateRangeStart" TIMESTAMP(3) NOT NULL,
    "dateRangeEnd" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_employees_employeeId_key" ON "platform_employees"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_employees_officialEmail_key" ON "platform_employees"("officialEmail");

-- CreateIndex
CREATE INDEX "platform_employees_status_idx" ON "platform_employees"("status");

-- CreateIndex
CREATE INDEX "invitations_status_idx" ON "invitations"("status");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_invitationId_key" ON "clinics"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "clinics_email_key" ON "clinics"("email");

-- CreateIndex
CREATE INDEX "clinics_status_idx" ON "clinics"("status");

-- CreateIndex
CREATE INDEX "clinic_specialities_clinicId_idx" ON "clinic_specialities"("clinicId");

-- CreateIndex
CREATE INDEX "clinic_working_days_clinicId_idx" ON "clinic_working_days"("clinicId");

-- CreateIndex
CREATE INDEX "clinic_sessions_clinicId_idx" ON "clinic_sessions"("clinicId");

-- CreateIndex
CREATE INDEX "clinic_photos_clinicId_idx" ON "clinic_photos"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_email_key" ON "vendors"("email");

-- CreateIndex
CREATE INDEX "vendors_status_idx" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "vendor_allocated_clinics_clinicId_idx" ON "vendor_allocated_clinics"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_allocated_clinics_vendorId_clinicId_key" ON "vendor_allocated_clinics"("vendorId", "clinicId");

-- CreateIndex
CREATE INDEX "vendor_downtime_vendorId_idx" ON "vendor_downtime"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "advertisers_invitationId_key" ON "advertisers"("invitationId");

-- CreateIndex
CREATE INDEX "advertisers_status_idx" ON "advertisers"("status");

-- CreateIndex
CREATE INDEX "advertisers_email_idx" ON "advertisers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mous_clinicId_key" ON "mous"("clinicId");

-- CreateIndex
CREATE INDEX "mous_status_idx" ON "mous"("status");

-- CreateIndex
CREATE INDEX "installation_requests_clinicId_idx" ON "installation_requests"("clinicId");

-- CreateIndex
CREATE INDEX "installation_requests_status_idx" ON "installation_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "installation_assignments_installationRequestId_key" ON "installation_assignments"("installationRequestId");

-- CreateIndex
CREATE INDEX "installation_assignments_clinicId_idx" ON "installation_assignments"("clinicId");

-- CreateIndex
CREATE INDEX "installation_assignments_vendorId_idx" ON "installation_assignments"("vendorId");

-- CreateIndex
CREATE INDEX "installation_assignments_status_idx" ON "installation_assignments"("status");

-- CreateIndex
CREATE INDEX "installation_otps_installationAssignmentId_idx" ON "installation_otps"("installationAssignmentId");

-- CreateIndex
CREATE INDEX "installation_otps_status_idx" ON "installation_otps"("status");

-- CreateIndex
CREATE INDEX "devices_clinicId_idx" ON "devices"("clinicId");

-- CreateIndex
CREATE INDEX "devices_vendorId_idx" ON "devices"("vendorId");

-- CreateIndex
CREATE INDEX "devices_pairingStatus_idx" ON "devices"("pairingStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ad_categories_name_key" ON "ad_categories"("name");

-- CreateIndex
CREATE INDEX "advertisements_status_idx" ON "advertisements"("status");

-- CreateIndex
CREATE INDEX "advertisements_moderationStatus_idx" ON "advertisements"("moderationStatus");

-- CreateIndex
CREATE INDEX "advertisements_advertiserId_idx" ON "advertisements"("advertiserId");

-- CreateIndex
CREATE INDEX "ad_vouchers_advertisementId_idx" ON "ad_vouchers"("advertisementId");

-- CreateIndex
CREATE INDEX "moderation_results_advertisementId_idx" ON "moderation_results"("advertisementId");

-- CreateIndex
CREATE INDEX "encoding_jobs_advertisementId_idx" ON "encoding_jobs"("advertisementId");

-- CreateIndex
CREATE INDEX "encoding_jobs_status_idx" ON "encoding_jobs"("status");

-- CreateIndex
CREATE INDEX "schedules_playDate_idx" ON "schedules"("playDate");

-- CreateIndex
CREATE INDEX "schedules_clinicId_playDate_idx" ON "schedules"("clinicId", "playDate");

-- CreateIndex
CREATE INDEX "schedules_deviceId_idx" ON "schedules"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "schedules_advertisementId_clinicId_playDate_key" ON "schedules"("advertisementId", "clinicId", "playDate");

-- CreateIndex
CREATE INDEX "ad_clinic_exposure_lastShownAt_idx" ON "ad_clinic_exposure"("lastShownAt");

-- CreateIndex
CREATE INDEX "play_logs_deviceId_playedAt_idx" ON "play_logs"("deviceId", "playedAt");

-- CreateIndex
CREATE INDEX "play_logs_advertisementId_playedAt_idx" ON "play_logs"("advertisementId", "playedAt");

-- CreateIndex
CREATE INDEX "payments_advertiserId_idx" ON "payments"("advertiserId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "report_exports_advertiserId_idx" ON "report_exports"("advertiserId");

-- CreateIndex
CREATE INDEX "audit_log_entity_entityId_idx" ON "audit_log"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_log_changedAt_idx" ON "audit_log"("changedAt");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "platform_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinics" ADD CONSTRAINT "clinics_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_specialities" ADD CONSTRAINT "clinic_specialities_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_working_days" ADD CONSTRAINT "clinic_working_days_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_sessions" ADD CONSTRAINT "clinic_sessions_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_photos" ADD CONSTRAINT "clinic_photos_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_allocated_clinics" ADD CONSTRAINT "vendor_allocated_clinics_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_allocated_clinics" ADD CONSTRAINT "vendor_allocated_clinics_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_allocated_clinics" ADD CONSTRAINT "vendor_allocated_clinics_allocatedBy_fkey" FOREIGN KEY ("allocatedBy") REFERENCES "platform_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_downtime" ADD CONSTRAINT "vendor_downtime_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisers" ADD CONSTRAINT "advertisers_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mous" ADD CONSTRAINT "mous_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mous" ADD CONSTRAINT "mous_complianceManagerId_fkey" FOREIGN KEY ("complianceManagerId") REFERENCES "platform_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_requests" ADD CONSTRAINT "installation_requests_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_requests" ADD CONSTRAINT "installation_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "platform_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_assignments" ADD CONSTRAINT "installation_assignments_installationRequestId_fkey" FOREIGN KEY ("installationRequestId") REFERENCES "installation_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_assignments" ADD CONSTRAINT "installation_assignments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_assignments" ADD CONSTRAINT "installation_assignments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_assignments" ADD CONSTRAINT "installation_assignments_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "platform_employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_otps" ADD CONSTRAINT "installation_otps_installationAssignmentId_fkey" FOREIGN KEY ("installationAssignmentId") REFERENCES "installation_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installation_otps" ADD CONSTRAINT "installation_otps_confirmedByVendorId_fkey" FOREIGN KEY ("confirmedByVendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertisers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ad_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "pricing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_vouchers" ADD CONSTRAINT "ad_vouchers_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_results" ADD CONSTRAINT "moderation_results_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_results" ADD CONSTRAINT "moderation_results_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "platform_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encoding_jobs" ADD CONSTRAINT "encoding_jobs_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_clinic_exposure" ADD CONSTRAINT "ad_clinic_exposure_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_clinic_exposure" ADD CONSTRAINT "ad_clinic_exposure_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_logs" ADD CONSTRAINT "play_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "play_logs" ADD CONSTRAINT "play_logs_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertisers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "advertisements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "advertisers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
