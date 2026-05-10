# Gym Tracker Manual Test Cases

## Pre-requisites
- The application must be running locally (`npm run dev`).
- The user must be authenticated and logged into the application.
- Navigate to the **Gym Tracker** app (e.g., `http://localhost:5173/gym`).

## Test Case 1: Fixing State Mutation Bug in Log Section
**Description:** Verify that adding, removing, and updating sets in the "Log" section works smoothly without any state-related crashes or UI lagging caused by direct state mutations.

**Steps:**
1. Navigate to the **Exercises** tab and ensure at least one exercise exists (e.g., "Bench Press").
2. Switch to the **Log** tab (New Session).
3. Select an exercise to add it to the session.
4. Click **Add Set** to add multiple sets to the exercise.
5. In the added sets, try typing `Reps` and `Weight` values.
6. Click the **Trash** icon to delete one of the sets.

**Expected Result:**
- Sets should be added and removed correctly without affecting other sets.
- Input fields for `Reps`, `Weight`, and `Notes` should update instantly without losing focus or causing unexpected UI behaviors.
- The state should be updated immutably.

## Test Case 2: Edit a Workout Record
**Description:** Verify that users can edit an existing workout log from the History tab.

**Steps:**
1. Log a new session with at least one exercise and a set (e.g., 10 reps, 50kg) and click **Finish Workout**.
2. Go to the **History** tab.
3. Locate the newly added session and click the **Edit (pencil)** button next to the Trash icon.
4. Verify that the app navigates back to the **Log** tab.
5. Verify that the previous session details (Date, Exercises, Sets, Reps, Weights, Notes) are pre-filled correctly.
6. Make a modification (e.g., change the weight to 60kg or add a new set).
7. Click **Update Workout**.

**Expected Result:**
- The workout should be updated successfully.
- The app should redirect to the **History** tab, and the modifications should be visible in the history view.
- No new workout should be created; the existing one should be modified.

## Test Case 3: Cancel an Edit
**Description:** Verify that an editing operation can be safely canceled without saving partial changes.

**Steps:**
1. Go to the **History** tab and click the **Edit (pencil)** button on a workout.
2. In the **Log** tab, click **Cancel Edit** below the Update Workout button.
3. Navigate back to the **History** tab.

**Expected Result:**
- The session should remain unchanged.
- The edit mode should exit cleanly, and the Log tab should reset to a blank "New Session".
