const Lead = require("../models/lead");
const Course = require("../models/course");
const Status = require("../models/status");
const Branch = require("../models/branch");
const Source = require("../models/source");
const Student = require("../models/student");
const FollowUp = require("../models/followUp");
const User_type = require("../models/user_type");
const CounsellorAssignment = require("../models/counsellorAssignment");
const { default: mongoose } = require("mongoose");
// const { emitNotification } = require("../service/notification");
const User = require("../models/user");
const Notification = require("../models/notification");
const notificationController = require('../controllers/notificationController')
const startTime = 8
const endTime = 17
const threshold = 4
//get all leads
async function getLeads(req, res) {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Sserver Error" });
  }
}

//get one lead
async function getLead(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findById({ _id: id });

  if (!lead) {
    res.status(400).json({ error: "No such lead" });
  }

  res.status(200).json(lead);
}

async function restoreLead(req, res) {
  const { id } = req.body;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findById({ _id: id });

  if (!lead) {
    return res.status(400).json({ error: "No such lead" });
  }

  // Assuming you have a FollowUp model with a reference to Lead
  const followUps = await FollowUp.find({ lead_id: id }).sort({ date: -1 }).limit(1);
  console.log(followUps)
  if (followUps.length === 0) {
    return res.status(404).json({ error: "No follow-up entries for the lead" });
  }

  const lastFollowUpId = followUps[0]._id;

  // Delete the last entry in the FollowUp table
  await FollowUp.findByIdAndDelete(lastFollowUpId);
  const newLastFollowUp = await FollowUp.find({ lead_id: id }).sort({ date: -1 }).limit(1);
  const updatedLead = await Lead.findByIdAndUpdate(
    id, // Assuming 'id' is the lead's ID you want to update
    { $set: { status_id: newLastFollowUp[0].status_id } }, // Update the 'status' field to the desired new value
    { new: true } // Set to true to return the modified document rather than the original
  );

  if(updateLead){
  res.status(200).json({ message: "Lead restored successfully" });
  }
  else{
    return res.status(400).json({ error: "An error occured" });

  }
}

//add new lead
async function addLead(req, res) {
  try {
    const { date, sheduled_to, course_name, branch_name, student_id, user_id } =
      req.body;

    // Check if course_name exists in the course table
    const course_document = await Course.findOne({ name: course_name });
    if (!course_document) {
      return res
        .status(400)
        .json({ error: `Course not found: ${course_name}` });
    }

    // Check if branch_name exists in the branch table
    const branch_document = await Branch.findOne({ name: branch_name });
    if (!branch_document) {
      return res
        .status(400)
        .json({ error: `Branch not found: ${branch_name}` });
    }

    // Current datetime
    const currentDateTime = new Date();

    // Check if student exists in the student table
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ error: "No such student" });
    }

    // Check if user exists in the user table
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "No such user" });
    }

    // Check if source name exists in the source table
    const source_document = await Source.findOne({ name: "manual" });
    if (!source_document) {
      return res.status(400).json({ error: `Source not found: manual` });
    }


    // Create new lead
    const newLead = await Lead.create({
      date: date,
      sheduled_at: currentDateTime,
      scheduled_to: sheduled_to,
      course_id: course_document._id,
      branch_id: branch_document._id,
      student_id: student_id,
      user_id: user_id,
      source_id: source_document._id,
    });

    // Send success response
    res.status(200).json(newLead);

    var cid;

    const { leastAllocatedCounselor } = await getLeastAndNextLeastAllocatedCounselors(course_document._id.toString());

    if (leastAllocatedCounselor) {
      const cid = leastAllocatedCounselor._id;

      // Create new counselor assignment
      const newCounsellorAssignment = await CounsellorAssignment.create({
        lead_id: newLead._id,
        counsellor_id: cid,
        assigned_at: date,
      });

      const studentDoc = await Student.findById({ _id: student_id })

      // Update lead with assignment_id
      newLead.assignment_id = newCounsellorAssignment._id;
      newLead.counsellor_id = cid;
      await newLead.save();

      console.log('notification was called')
      await notificationController.sendNotificationToCounselor(
        cid,
        `You have assigned a new lead belongs to ${studentDoc.email}.`,
        "success"
      );
      console.log('notification was called after')

      console.log("lead", newLead)
      console.log("assignment", newCounsellorAssignment)
    } else {
      console.log("No counselor available");
    }


  } catch (error) {
    // Log error
    console.log("Error adding leads:", error);

    // Send internal server error response
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//update lead
async function updateLead(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!lead) {
    res.status(400).json({ error: "no such lead" });
  }

  res.status(200).json(lead);
}

// get all leads from database (should retrive details that related to referenced tables and latest follwo up status)
async function getLeadsSummaryDetails(req, res) {
  try {
    const leads = await Lead.find()
      .populate("student_id", "name contact_no dob address email nic")
      .populate("course_id", "name")
      .populate("branch_id", "name")
      .populate("source_id", "name")
      .populate("status_id", "name")
      .populate({
        path: "assignment_id",
        select: "counsellor_id",
        populate: {
          path: "counsellor_id",
          model: "User",
          select: "name"
        }
      })
      .lean()
      .exec();
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const formattedD = `${year}-${month}-${day}`;
  return formattedD;
}
//get one lead
async function getOneLeadSummaryDetails(req, res) {
  const { id } = req.params;
  try {
    const lead = await Lead.findById({ _id: id })
      .populate("course_id", "name")
      .populate("branch_id", "name")
      .exec();

    // Find the latest follow-up for the current lead
    const latestFollowUp = await FollowUp.findOne({ lead_id: id })
      .sort({ date: -1 })
      .populate("status_id", "name")
      .exec();

    const student = await Student.findById({ _id: lead.student_id });

    // Process lead and latest follow-up
    const leadDetail = {
      id: lead._id,
      date: formatDate(lead.date),
      scheduled_at: formatDate(lead.scheduled_at),
      scheduled_to: formatDate(lead.scheduled_to),
      name: student.name,
      contact_no: student.contact_no,
      nic: student.nic,
      dob: formatDate(student.dob),
      email: student.email,
      student_id: student._id,
      address: student.address,
      course: lead.course_id.name,
      branch: lead.branch_id.name,
      status: latestFollowUp ? latestFollowUp.status_id.name : null,
      comment: latestFollowUp ? latestFollowUp.comment : null,
    };

    console.log(leadDetail);
    res.status(200).json(leadDetail);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function checkForDuplicate(req, res) {
  const { courseName, branchName, studentNIC } = req.query;

  try {
    // Find the course and branch IDs based on their names
    const course = await Course.findOne({ name: courseName });
    const branch = await Branch.findOne({ name: branchName });

    // Find the student based on name and contact number
    const student = await Student.findOne({ nic: studentNIC });

    if (!course || !branch || !student) {
      return res.status(200).json({
        isDuplicate: false,
        message: "Incomplete information provided.",
      });
    }

    // Check for duplicate lead based on course, branch, and student IDs
    const duplicateLead = await Lead.findOne({
      course_id: course._id,
      branch_id: branch._id,
      student_id: student._id,
    });

    return res.status(200).json({ isDuplicate: !!duplicateLead }); // Returns true if a duplicate lead is found, false otherwise
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error checking for duplicate:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


async function getLeastAndNextLeastAllocatedCounselors(productType) {
  try {
    // Fetch all counselors (user_type with name 'Counselor')
    const counselorType = await User_type.findOne({ name: 'counselor' });
    const counselors = await User.find({ user_type: counselorType._id });
    // console.log(counselors);

    // Fetch leads with counselors allocated
    const leadsWithCounselors = await CounsellorAssignment.find();
    // console.log(leadsWithCounselors);

    // Filter counselors based on the specified productType
    const filteredCounselors = counselors.filter((counselor) => {
      return counselor.product_type && counselor.product_type.split(', ').includes(productType);
    });

    // console.log(filteredCounselors)

    // Count the number of leads each counselor has
    const counselorLeadCounts = filteredCounselors.map((counselor) => {
      const count = leadsWithCounselors.filter((assignment) => {
        return assignment.counsellor_id && assignment.counsellor_id.equals(counselor._id);
      }).length;
      return { counselor, count };
    });

    // Sort counselors by lead count in ascending order
    counselorLeadCounts.sort((a, b) => a.count - b.count);

    // console.log(counselorLeadCounts);

    if (counselorLeadCounts) {
      // Return the least and next least allocated counselors
      const leastAllocatedCounselor = counselorLeadCounts[0]?.counselor || null;
      const nextLeastAllocatedCounselor = counselorLeadCounts[1]?.counselor || null;
      console.log("check", { leastAllocatedCounselor, nextLeastAllocatedCounselor });
      return { leastAllocatedCounselor, nextLeastAllocatedCounselor };
    } else {
      console.log("No counsellor");
      return null;
    }

  } catch (error) {
    console.error('Error fetching least allocated counselors:', error);
    throw error;
  }
}

async function assignLeadsToCounselors() {
  console.log("ok")
  try {
    // Get leads with an assigned lead status
    const leadsWithAssignedStatus = await Lead.find({
      assignment_id: { $exists: true }, status_id: '65ada2f8da40b8a3e87bda82'
    });

    const leadsToReassign = await Promise.all(leadsWithAssignedStatus.map(async (lead) => {

      //find latest counsellor asssgnment for the lead
      const leadLastAssigned = await CounsellorAssignment.findOne({ lead_id: lead._id })
        .sort({ assigned_at: -1 })
        .exec();

      const currentTime = new Date().getHours;
      const statusChangedTime = leadLastAssigned.assigned_at;

      // if (statusChangedTime.getHours() + threshold < endTime) {
      //   return null
      // }

      const addedTime = leadLastAssigned.assigned_at.getHours

      //Check leads came after 17h to 8h
      if (!(addedTime >= startTime && addedTime <= endTime)) {
        if (Math.abs(currentTime - startTime) >= threshold) {
          return lead
        }
        else {
          return null
        }
      }
      //Check leads came before 17h but not filled with 4h threshold
      if (Math.abs(addedTime - endTime) <= 4) {
        if ((Math.abs(addedTime - endTime)) + (Math.abs(currentTime - startTime)) >= threshold) {
          return lead
        }
        else {
          return null
        }
      }

      //Other normal flow
      if (Math.abs(currentTime - addedTime) >= threshold) {
        return lead
      }
      else {
        return null
      }

    }));

    // Remove null values from the leadsToReassign array
    const filteredLeadsToReassign = leadsToReassign.filter((lead) => lead !== null);

    // Assign leads to counselors
    for (const lead of filteredLeadsToReassign) {

      //find latest counsellor assignment for the lead
      const latestAssignment = await CounsellorAssignment.findOne({ lead_id: lead._id }).sort({ assigned_at: -1 }).exec();
      const leadDoc = await Lead.findOne({ _id: lead._id }).populate("student_id", "email")

      console.log('notification was called')
      await notificationController.sendNotificationToCounselor(
        latestAssignment.counsellor_id,
        `The lead belongs to ${leadDoc.student_id.email} has been revoked from you.`,
        "error"
      );
      console.log('notification was called after')

      // Get the least and next least allocated counselors
      const { leastAllocatedCounselor, nextLeastAllocatedCounselor } = await getLeastAndNextLeastAllocatedCounselors(lead.course_id.toString());

      //check if the lead allocated to same counselor
      if (latestAssignment.counsellor_id && latestAssignment.counsellor_id.equals(leastAllocatedCounselor)) {

        try {
          const currentDateTime = new Date();

          //create new counsellor assignment
          const counsellorAssignment = await CounsellorAssignment.create({
            lead_id: lead._id,
            counsellor_id: nextLeastAllocatedCounselor._id,
            assigned_at: currentDateTime
          });

          // Update lead with assignment_id
          lead.assignment_id = counsellorAssignment._id;
          lead.counsellor_id = nextLeastAllocatedCounselor._id;
          await lead.save();

          console.log("lead", lead)
          console.log('notification was called')
          await notificationController.sendNotificationToCounselor(
            nextLeastAllocatedCounselor._id,
            `You have assigned a new lead belongs to ${leadDoc.student_id.email}.`,
            "success"
          );
          console.log('notification was called after')

        } catch (error) {
          console.log(error)
        }
      } else {
        //if the counsello is different
        try {
          const currentDateTime = new Date();

          //create new counsellor assignment
          const counsellorAssignment = await CounsellorAssignment.create({
            lead_id: lead._id,
            counsellor_id: leastAllocatedCounselor._id,
            assigned_at: currentDateTime
          });

          // Update lead with assignment_id
          lead.assignment_id = counsellorAssignment._id;
          lead.counsellor_id = leastAllocatedCounselor._id;
          await lead.save();

          console.log('notification was called')
          await notificationController.sendNotificationToCounselor(
            leastAllocatedCounselor._id,
            `You have assigned a new lead belongs to ${leadDoc.student_id.email}.`,
            "success"
          );
          console.log('notification was called after')

          console.log("lead", lead)
          console.log("assignment", counsellorAssignment)
        } catch (error) {
          console.log(error)
        }
      }
    }
    console.log("Allocation completed");
  } catch (error) {
    console.error('Error assigning leads to counselors:', error);
    throw error;
  }
}



async function assignLeadsToCounselorsTest(req,res) {
  const startTime = 8
  const endTime = 17
  const threshold = 4
  const { added_time,current_time} = req.body;
  const addedTime = added_time;
  const currentTime = current_time
  console.log(addedTime,currentTime,req.body)

      //Check leads came after 17h to 8h
      if (!(addedTime >= startTime && addedTime <= endTime)) {
        if (Math.abs(currentTime - startTime) >= threshold) {
          res.status(200).json('reassigned')
          return
        }
        else {
          res.status(200).json('not reassigned')
          return
        }
      }
      //Check leads came before 17h but not filled with 4h threshold
      if (Math.abs(addedTime - endTime) <= 4) {
        if ((Math.abs(addedTime - endTime)) + (Math.abs(currentTime - startTime)) >= threshold) {
          res.status(200).json('reassigned')
          return
        }
        else {
          res.status(200).json('not reassigned')
          return
        }
      }

      //Other normal flow
      if (Math.abs(currentTime - addedTime) >= threshold) {
        res.status(200).json('reassigned')
        return
      }
      else {
        res.status(200).json('not reassigned')
        return
      }

}


function scheduleNextExecution() {
  const currentHour = new Date().getHours();

  // Check if the current time is between 8 am and 5 pm
  if (currentHour >= startTime && currentHour <= endTime) {
    // Call the function every minute
    setInterval(() => {
      assignLeadsToCounselors();
    }, 60000);
  } else {
    console.log('Scheduled time is over. Task will resume tomorrow at 8 am.');
  }

  // Schedule the next check after 1 hour
  setTimeout(scheduleNextExecution, 3600000); // 1 hour in milliseconds
}

// Start the initial execution
scheduleNextExecution();


module.exports = {
  getLeads,
  addLead,
  getLead,
  updateLead,
  getLeadsSummaryDetails,
  checkForDuplicate,
  getOneLeadSummaryDetails,
  getLeastAndNextLeastAllocatedCounselors,
  assignLeadsToCounselorsTest,
  restoreLead
};
