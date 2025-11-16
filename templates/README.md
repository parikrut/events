# Event Templates - 3 CSV Files

This folder contains **3 simple CSV files** for importing your complete event data.

---

## 📁 Files

1. **`1-event-organizer.csv`** - Your main event details (1 row)
2. **`2-event-types.csv`** - Your individual events (multiple rows)
3. **`3-guest-list.csv`** - Your guest list with event columns (multiple rows)

---

## 🎯 The Smart Guest List Format

The key innovation is in **File #3** where:

- **Rows** = Guests
- **Columns** = Events (dynamic based on your events)
- **Values** = Invitation status:
  - `0` = Not invited (won't see this event)
  - `-1` = Invited with unlimited guests (VIP)
  - `1` = Solo invitation
  - `2`, `3`, `4+` = Invited with that many people total

### Example Guest List:

If you have events: `mehndi`, `sangeet`, `ceremony`, `reception`

```csv
fullName,email,phone,notes,mehndi,sangeet,ceremony,reception
Priya Sharma,priya@example.com,+91-123,Best friend,-1,-1,-1,-1
Raj Kumar,raj@example.com,+91-456,College friend,0,0,4,4
Mrs. Patel,geeta@example.com,+91-789,Aunt,1,0,0,0
```

**What this means:**

- **Priya**: Sees ALL 4 events, unlimited guests
- **Raj**: Sees ONLY ceremony & reception (can bring 3 more people)
- **Mrs. Patel**: Sees ONLY mehndi event (solo)

---

## 📝 File Details

### File 1: `1-event-organizer.csv`

**Purpose:** Your main event information (wedding, house warming, etc.)

**Columns:**

- `title` ✅ REQUIRED - Event name (e.g., "Avish & Priya's Wedding")
- `slug` ✅ REQUIRED - URL-friendly (e.g., "avish-priya-wedding-2025")
- `organizerName` ✅ REQUIRED - Your name
- `organizerEmail` ✅ REQUIRED - Your email
- `groomName` - For weddings only
- `brideName` - For weddings only
- `hostName` - For non-wedding events
- `description` - Brief description
- `theme` - Color theme (royal-gold, modern-blue, etc.)
- `logoUrl` - Logo image URL

**Note:** Include only **ONE row** with your event details

---

### File 2: `2-event-types.csv`

**Purpose:** All individual events (Mehndi, Sangeet, Ceremony, etc.)

**Columns:**

- `slug` ✅ REQUIRED - Short ID (e.g., "mehndi", "ceremony")
  - **⚠️ IMPORTANT:** These become column headers in guest list!
- `name` ✅ REQUIRED - Display name (e.g., "Mehndi Ceremony")
- `description` - Brief description
- `date` ✅ REQUIRED - Format: YYYY-MM-DD (e.g., "2025-12-20")
- `time` ✅ REQUIRED - Display time (e.g., "3:00 PM")
- `timezone` ✅ REQUIRED - (e.g., "Asia/Kolkata", "America/New_York")
- `country` - Country name
- `venue` ✅ REQUIRED - Venue name
- `address` ✅ REQUIRED - Full address
- `addressUrl` - Google Maps link
- `dressCode` - Dress code
- `capacity` - Max capacity (leave blank = unlimited)

**Note:** Add as many rows as you have events (typically 2-4)

---

### File 3: `3-guest-list.csv`

**Purpose:** Guest list with event-specific invitations

**Fixed Columns (First 4):**

- `fullName` ✅ REQUIRED - Guest's name
- `email` ✅ REQUIRED - Unique email
- `phone` - Phone with country code
- `notes` - Internal notes

**Dynamic Event Columns:**
After the 4 fixed columns, add ONE column for EACH event from File 2.

**Column Names:** Use exact `slug` values from `2-event-types.csv`

**Column Values:**

- `0` = NOT invited (guest won't see this event)
- `-1` = Unlimited attendees (VIPs, wedding party, close family)
- `1` = Solo only (no plus one)
- `2` = Can bring 1 more person (couple)
- `3` = Can bring 2 more people
- `4+` = Families (e.g., 4 = family of 4, 6 = family of 6)

---

## 🚀 How to Use

### Step 1: Prepare Your Files

1. **Open all 3 CSV files** in Excel or Google Sheets
2. Study the example data (Indian wedding with 4 events, 7 guests)

### Step 2: Fill File 1 (Event Organizer)

1. Replace the example row with YOUR event details
2. Delete the example row
3. Save the file

### Step 3: Fill File 2 (Event Types)

1. List all your events (2-4 rows typically)
2. **Write down the `slug` values** - you'll need them!
3. Fill in all event details (date, time, venue, etc.)
4. Save the file

### Step 4: Fill File 3 (Guest List)

1. **FIRST:** Update column headers (after the 4 fixed columns)
   - Replace: `mehndi`, `sangeet`, `ceremony`, `reception`
   - With: YOUR event slugs from Step 3
2. **THEN:** Add your guests (one row per guest)

   - Fill in: fullName, email, phone, notes
   - For each event column, enter: 0, -1, 1, 2, 3, 4, etc.

3. Save the file

### Step 5: Import

```bash
npm run import:csv
```

---

## 💡 Common Scenarios

### Wedding with 4 Events

**Events:** Mehndi (ladies), Sangeet, Ceremony, Reception

| Guest Type                  | mehndi | sangeet | ceremony | reception |
| --------------------------- | ------ | ------- | -------- | --------- |
| Bride's friend (all events) | -1     | -1      | -1       | -1        |
| Groom's aunt (ladies only)  | 1      | 0       | 0        | 0         |
| Work colleague (+1)         | 0      | 2       | 2        | 2         |
| Family of 4                 | 0      | 0       | 4        | 4         |
| Wedding party (unlimited)   | -1     | -1      | -1       | -1        |

### House Warming with 2 Events

**Events:** Puja (morning prayer), Lunch

| Guest Type               | puja | lunch |
| ------------------------ | ---- | ----- |
| Close family (unlimited) | -1   | -1    |
| Relatives (family of 4)  | 4    | 4     |
| Friends (skip prayer)    | 0    | 2     |

---

## ⚠️ Important Rules

### 1. Event Slug Matching

Event slugs MUST match exactly:

✅ **CORRECT:**

```
File 2 (event): slug = mehndi
File 3 (guest): column header = mehndi
```

❌ **WRONG:**

```
File 2 (event): slug = mehndi
File 3 (guest): column header = Mehndi  ← Case mismatch!
```

### 2. Unique Emails

Every guest needs a unique email address.

### 3. Value Meanings

Remember what the numbers mean:

- `0` = NOT invited
- `-1` = Unlimited
- `1+` = That many people total (including the guest)

### 4. Date Format

Always use `YYYY-MM-DD`:

- ✅ 2025-12-20
- ❌ 12/20/2025
- ❌ 20-Dec-2025

---

## 📊 Visual Examples

### Example: 4 Events, 7 Guests

**Your events (File 2):**

```
mehndi, sangeet, wedding-ceremony, reception
```

**Your guest list (File 3):**

```csv
fullName,email,phone,notes,mehndi,sangeet,wedding-ceremony,reception
Priya Sharma,priya@ex.com,+91-111,Best friend,-1,-1,-1,-1
Mrs. Patel,geeta@ex.com,+91-222,Aunt,1,0,0,0
Raj Kumar,raj@ex.com,+91-333,Friend,0,0,4,4
Amit Desai,amit@ex.com,+91-444,Colleague,0,2,2,2
Shah Family,shah@ex.com,+91-555,Bride family,6,6,6,6
Dr. Mehta,vikram@ex.com,+91-666,Family doctor,0,0,2,2
Ravi Patel,ravi@ex.com,+91-777,Brother,-1,-1,-1,-1
```

**Result:**

- Priya sees: All 4 events, unlimited
- Mrs. Patel sees: Only mehndi, solo
- Raj sees: Only ceremony & reception, can bring 3 more
- Amit sees: Sangeet, ceremony, reception (no mehndi), +1
- Shah Family sees: All events, can bring 5 more
- Dr. Mehta sees: Only ceremony & reception, +1
- Ravi sees: All events, unlimited

---

## 🎓 Tips

1. **Plan first:** List out who should see which events before filling the CSV
2. **Use Excel/Sheets:** Much easier than editing raw CSV
3. **Test small:** Import 2-3 guests first to verify
4. **Keep notes:** Use the notes column to remember who's who
5. **Backup:** Save your filled CSVs before importing

---

## ❓ FAQ

**Q: Can I have more than 4 events?**
Yes! Add more rows to File 2, and more columns to File 3.

**Q: Can I have just 2 events?**
Yes! Use only 2 rows in File 2, and only 2 event columns in File 3.

**Q: What if I need to add guests later?**
Create a new File 3 with just the new guests and re-run import.

**Q: Can someone be invited to non-consecutive events?**
Yes! Example: `mehndi=4, sangeet=0, ceremony=4, reception=4`

**Q: What's the difference between -1 and 100?**

- `-1` = Truly unlimited (system doesn't track/limit)
- `100` = Can bring up to 99 more people (system enforces limit)

---

## 🔧 Troubleshooting

**"Column not found" error:**

- Check that event slugs in File 3 match File 2 exactly

**"Duplicate email" error:**

- Each guest needs a unique email address

**Date parsing error:**

- Use YYYY-MM-DD format (2025-12-20)

**Import script not found:**

- Make sure you're in the project root directory
- Run: `npm run import:csv`

---

## ✅ Quick Checklist

Before importing:

- [ ] File 1 has ONE row with your event details
- [ ] File 2 has all your events with slugs noted
- [ ] File 3 column headers match File 2 slugs exactly
- [ ] File 3 has all guests with invitation numbers (0, -1, 1, 2, etc.)
- [ ] All emails are unique
- [ ] All dates are YYYY-MM-DD format
- [ ] Saved all files as CSV

Then run:

```bash
npm run import:csv
```
