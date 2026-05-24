import path from 'path';
import Offer from '../models/Offer.js';
import Student from '../models/Student.js';
import PlacementDrive from '../models/PlacementDrive.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createNotification } from '../services/notificationService.js';
import { emitToAdmin, emitToUser } from '../config/socket.js';
import { logAudit } from '../services/auditService.js';
import { PLACEMENT_POLICY } from '../config/placementPolicy.js';

const populateOffer = (query) =>
  query
    .populate('studentId', 'fullName rollNumber branch department user')
    .populate('driveId', 'companyName role package location')
    .populate('companyId', 'name');

export const createOfferFromApplication = async ({ application, actor, ipAddress }) => {
  const drive = application.drive;
  const student = application.student;

  const offer = await Offer.findOneAndUpdate(
    { studentId: student._id, driveId: drive._id },
    {
      studentId: student._id,
      companyId: drive.company,
      driveId: drive._id,
      applicationId: application._id,
      packageOffered: drive.package,
      role: drive.role,
      location: drive.location,
      offerStatus: 'pending',
      adminVerificationStatus: 'pending',
      $push: {
        history: {
          action: 'created',
          actor: actor?._id,
          remarks: 'Offer created from selected application',
        },
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  await Student.findByIdAndUpdate(student._id, {
    currentOfferStatus: 'pending',
    placedCompany: drive.companyName,
    placedPackage: drive.package,
  });

  await createNotification({
    recipient: student.user,
    title: 'Offer Received',
    message: `${drive.companyName} offered ${drive.role} (${drive.package} LPA).`,
    type: 'selection',
    link: '/student/offers',
  });

  await logAudit({
    actor,
    actionType: 'OFFER_CREATED',
    targetEntity: 'Offer',
    targetId: offer._id,
    newValues: offer.toObject(),
    ipAddress,
  });

  emitToUser(student.user.toString(), 'offer-update', { offerId: offer._id });
  emitToAdmin('offer-update', { offerId: offer._id });

  return offer;
};

export const getOffers = asyncHandler(async (req, res) => {
  const { status, verification, studentId } = req.query;
  const query = {};
  if (status) query.offerStatus = status;
  if (verification) query.adminVerificationStatus = verification;
  if (studentId) query.studentId = studentId;

  const offers = await populateOffer(Offer.find(query)).sort({ createdAt: -1 });
  res.json({ success: true, data: offers });
});

export const getMyOffers = asyncHandler(async (req, res) => {
  const offers = await populateOffer(Offer.find({ studentId: req.student._id })).sort({ createdAt: -1 });
  res.json({ success: true, data: offers });
});

export const respondToOffer = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Offer status must be accepted or rejected');
  }

  const offer = await Offer.findOne({ _id: req.params.id, studentId: req.student._id });
  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  const oldValues = offer.toObject();
  offer.offerStatus = status;
  offer.remarks = remarks;
  offer.acceptedAt = status === 'accepted' ? new Date() : undefined;
  offer.rejectedAt = status === 'rejected' ? new Date() : undefined;
  offer.history.push({ action: status, actor: req.user._id, remarks });
  await offer.save();

  const studentUpdate = {
    currentOfferStatus: status,
    acceptedOfferId: status === 'accepted' ? offer._id : undefined,
  };
  if (status === 'accepted' && PLACEMENT_POLICY.lockStudentAfterAcceptedOffer) {
    studentUpdate.placementBlocked = true;
    studentUpdate.placementStatus = 'placed';
  }
  await Student.findByIdAndUpdate(req.student._id, studentUpdate);

  await logAudit({
    actor: req.user,
    actionType: `OFFER_${status.toUpperCase()}`,
    targetEntity: 'Offer',
    targetId: offer._id,
    oldValues,
    newValues: offer.toObject(),
    ipAddress: req.ip,
  });

  emitToAdmin('offer-update', { offerId: offer._id, status });
  res.json({ success: true, data: offer });
});

export const verifyOffer = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  if (!['verified', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Verification status must be verified or rejected');
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  const oldValues = offer.toObject();
  offer.adminVerificationStatus = status;
  offer.remarks = remarks || offer.remarks;
  offer.history.push({ action: `admin_${status}`, actor: req.user._id, remarks });
  await offer.save();

  await logAudit({
    actor: req.user,
    actionType: `OFFER_ADMIN_${status.toUpperCase()}`,
    targetEntity: 'Offer',
    targetId: offer._id,
    oldValues,
    newValues: offer.toObject(),
    ipAddress: req.ip,
  });

  emitToAdmin('offer-update', { offerId: offer._id, status });
  res.json({ success: true, data: offer });
});

export const uploadOfferLetter = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an offer letter PDF');
  }

  const offer = await Offer.findById(req.params.id);
  if (!offer) {
    res.status(404);
    throw new Error('Offer not found');
  }

  const oldValues = offer.toObject();
  offer.offerLetterUrl = `/uploads/offers/${path.basename(req.file.path)}`;
  offer.history.push({ action: 'offer_letter_uploaded', actor: req.user._id });
  await offer.save();

  await logAudit({
    actor: req.user,
    actionType: 'OFFER_LETTER_UPLOADED',
    targetEntity: 'Offer',
    targetId: offer._id,
    oldValues,
    newValues: offer.toObject(),
    ipAddress: req.ip,
  });

  res.json({ success: true, data: offer });
});
