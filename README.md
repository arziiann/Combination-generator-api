🧮 Combination Generator API

A Node.js + **PostgreSQL** API for generating valid combinations of items and storing them in a relational database using raw **PostgreSQL** queries and transactions.

---

## 📌 Project Objective

Build a RESTful API that:

- Accepts a list of item types and a required combination length
- Generates all valid combinations **where no two items share the same starting letter**
- Stores all generated items and combinations in a **PostgreSQL** database
- Returns the results in the API response, including a unique ID

---

## 🚀 API Endpoint

### `POST /generate`

**Request Body:**

```json
{
  "items": [1, 2, 1],
  "length": 2
}
````

> The input list (e.g. `[1, 2, 1]`) maps to item codes like `A1, B1, B2, C1`, etc.

### ✅ Rules:

* Items with the same **starting letter** (prefix) **cannot** be in the same combination
* Results are saved using **SQL transactions**
* Each response is stored in a separate table and associated with a unique `id`

---

## 🧾 Sample Response

```json
{
  "id": 1,
  "combination": [
    ["A1", "B1"],
    ["A1", "B2"],
    ["A1", "C1"],
    ["B1", "C1"],
    ["B2", "C1"]
  ]
}
```

---

## 🧱 Database Schema

The PostgreSQL database contains the following tables:

* `items`: Stores all generated items (e.g., A1, B1, C1)
* `combinations`: Stores each combination with a unique ID
* `responses`: Stores the result sent to the client

> All insertions are done using **PostgreSQL transactions** to ensure consistency

---

## 🛠️ Tech Stack

| Tech       | Description                            |
| ---------- | -------------------------------------- |
| Node.js    | Server runtime using Express           |
| Express    | Lightweight web framework              |
| PostgreSQL | Relational database                    |
| pg         | PostgreSQL client for Node.js          |

---

## 🧠 Detailed Example: Bitmask-Based Combination Generation

To fully understand how the algorithm works in practice, here’s a detailed breakdown using a concrete example.

### 🧾 Input

```json
{
  "items": [1, 2, 1],
  "length": 2
}
````

This means:

* Group A has 1 item → `A1`
* Group B has 2 items → `B1`, `B2`
* Group C has 1 item → `C1`

Corresponding group structure:

```text
A → [A1]  
B → [B1, B2]  
C → [C1]
```

### 🎯 Goal

We want to generate **all combinations of length 2**, such that **no two items come from the same group** (i.e., no duplicate prefixes).

---

## 💡 Step-by-Step with Bitmasks

We have 3 groups → we'll use **3-bit binary numbers** (`000` to `111`) to represent subsets of groups.

To generate combinations of length `2`, we only consider bitmasks where exactly **2 bits are set to 1**.

All 3-bit binary numbers:

| Binary | Decimal | Selected Groups                  |
| ------ | ------- | -------------------------------- |
| 000    | 0       | -                                |
| 001    | 1       | C                                |
| 010    | 2       | B                                |
| 011    | 3       | B, C ✅                           |
| 100    | 4       | A                                |
| 101    | 5       | A, C ✅                           |
| 110    | 6       | A, B ✅                           |
| 111    | 7       | A, B, C (invalid for length = 2) |

Valid masks: **011**, **101**, **110**

---

### 🧪 Let's go one by one:

---

### 🔹 1. Mask = `011` → Groups: **B, C**

Group contents:

```text
B → [B1, B2]  
C → [C1]
```

Now generate **Cartesian product** of B and C:

```
[B1, C1]  
[B2, C1]
```

✅ Valid combinations from `011`:

```json
[["B1", "C1"], ["B2", "C1"]]
```

---

### 🔹 2. Mask = `101` → Groups: **A, C**

Group contents:

```text
A → [A1]  
C → [C1]
```

Cartesian product:

```
[A1, C1]
```

✅ Valid combinations from `101`:

```json
[["A1", "C1"]]
```

---

### 🔹 3. Mask = `110` → Groups: **A, B**

Group contents:

```text
A → [A1]  
B → [B1, B2]
```

Cartesian product:

```
[A1, B1]  
[A1, B2]
```

✅ Valid combinations from `110`:

```json
[["A1", "B1"], ["A1", "B2"]]
```

---

## ✅ Final Result

Combining all valid combinations from the above:

```json
[
  ["B1", "C1"],
  ["B2", "C1"],
  ["A1", "C1"],
  ["A1", "B1"],
  ["A1", "B2"]
]
```

---

## ⚙️ Why This Approach Works

Using **bitmasks** gives you a very elegant and high-performance way to:

* Systematically iterate through all valid group combinations
* Avoid nested for-loops for subsets
* Precisely control how many groups (1s in mask) are included
* Easily scale up to more groups (up to 26 — A-Z)

Each bit in the mask represents whether a group is **included (1)** or **excluded (0)** from the current combination.

Then, by using the **Cartesian product** of the selected groups, we get **all valid item-level combinations**.

> 👨‍💻 Bitwise logic like this isn't just clever — it's fast and resource-efficient. You use binary to represent subsets, then combine only the group arrays needed. It turns a potentially complex combinatorial problem into a well-structured bit-level problem.

---

## 🌲 Alternative Approach: DFS Tree Traversal

Another traditional way to solve this type of problem is to **construct a tree** of possible item selections and use **depth-first search (DFS)** to generate all valid combinations.

Below is an ASCII illustration of that idea:

🌳 Combination Tree (DFS Style)

<pre>
          (root)
         /  |   \
      A1   B1   C1
     /  \    \
   B1  B2   C1
  /        \
C1         C1
</pre>

Each level of the tree corresponds to selecting an item from a different group (e.g., A, B, or C).  
Each path from the root to a leaf represents a potential combination that satisfies the constraints (no duplicate prefixes).

---

### 🔄 DFS with Recursion

Using recursion, one could write a function that:

1. Traverses the tree from the root
2. Keeps a stack or list of current selections
3. Skips branches where an item with a duplicate prefix is encountered
4. Backtracks when the required combination length is reached

While this approach is effective and intuitive for small datasets, it introduces a few key limitations:

- ❌ Requires careful management of **call stack depth**
- ❌ Slower for large inputs due to **recursion overhead**
- ❌ More error-prone when enforcing prefix uniqueness manually

---

## ⚡ Why I Avoided Recursive Tree Traversal

Instead of going the DFS/tree path, I implemented a **bitmask + cartesian product** approach, which is:

- ✅ Stack-free: avoids recursion entirely
- ✅ Extremely fast thanks to **bitwise operations**
- ✅ Scales efficiently for larger input sizes
- ✅ Automatically enforces constraints (unique prefixes)
- ✅ Easier to reason about and debug in production

This solution not only improves performance but also keeps the code clean and deterministic.

---

## 📌 Summary

| Approach               | Description                         | Pros                            | Cons                           |
|------------------------|-------------------------------------|----------------------------------|--------------------------------|
| Tree + DFS (recursive) | Traverse combinations as a tree     | Easy to visualize and implement | Slower, recursion depth limits |
| Bitmask + Cartesian    | Use bitwise masks for group combos  | Fast, efficient, constraint-safe| Slightly harder to conceptualize |

> 👨‍💻 While DFS is often used in combinatorics, in this case, the **bitmask solution** proved cleaner, faster, and more scalable — showing real-world backend optimization.


## 🗄️ Database Structure

The database uses three core tables:

### 🔹 `items`

Stores individual items like `A1`, `B1`, etc.

- Each row contains a unique item with `id` and `content`

### 🔹 `combinations`

Stores generated combinations of items (as a 2D string array)

- Each combination is linked to a single source item via `item_id`
- If the related item is deleted, its combination is also removed automatically (`ON DELETE CASCADE`)

### 🔹 `responses`

Stores the final response sent back to the user

- Each response contains a JSON structure of all valid combinations
- Also includes a timestamp (`created_at`) for tracking

![Database Schema](https://github.com/arziiann/test/blob/master/2025-07-09_09-52-54.png)
![Database Schema](https://github.com/arziiann/test/blob/master/2025-07-09_09-54-41.png)

Իհարկե, ահա քո ուղարկած կարգավորումների ու dependency-ների մասը՝ լիովին ձևաչափված `README.md`-ի Markdown սինտաքսով, որպեսզի ուղղակի կարողանաս տեղադրել․


## 🛠️ Setup Instructions

After cloning the repository, follow these steps to set up the project locally:

---

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/your-username/combination-generator.git
cd combination-generator/server
````

---


### 2. 🐘 Create PostgreSQL Database

Create a PostgreSQL database manually (must be named `combinations_db`) using your preferred method or CLI tool:

```bash
createdb combinations_db

### 3. ⚙️ Configure Environment Variables

Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` and set your local DB credentials:

```env
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
```

---

## 📦 Dependencies

This project relies on the following Node.js packages:

| Package       | Purpose                           | Install Command                      |
| ------------- | --------------------------------- | ------------------------------------ |
| `express`     | Web server framework              | `npm install express`                |
| `pg`          | PostgreSQL client for Node.js     | `npm install pg`                     |
| `npm-run-all` | Run multiple npm scripts in order | `npm install --save-dev npm-run-all` |

To install all dependencies at once (via `package.json`), run:

```bash
npm install
```

If you prefer installing manually:

```bash
npm install express pg
npm install --save-dev npm-run-all
```

---

Իհարկե, ահա միայն այդ հատվածը՝ ճիշտ `README.md` ֆորմատով, Markdown ձևաչափով․


### 4. 🚀 Start the Server

To start the server (along with initial database setup), run:

```bash
npm run dev
````

This will:

* 🛠️ Run database migrations (`npm run migrate`)
* 🚀 Start the Express server (`npm start`)

---

If everything is successful, your terminal will display:

```
Tables created  
Server running on port 3000
```

## 📬 Making a POST Request

Once the server is running, you can test the API using **Postman** or any other API client (e.g., Insomnia, Thunder Client).

### 🔧 Endpoint Details

- **Method**: `POST`  
- **URL**: `http://localhost:3000/generate`  
- **Headers**:  
  `Content-Type: application/json`

### 📤 Request Body (JSON)

```json
{
  "items": [1, 2, 2],
  "length": 3
}
````

> This input creates 3 item groups:
>
> * Group A: 1 item → `A1`
> * Group B: 2 items → `B1`, `B2`
> * Group C: 2 items → `C1`, `C2`

---

### 📥 Sample Response

```json
{
  "id": 9,
  "combination": [
    ["A1", "B1", "C1"],
    ["A1", "B1", "C2"],
    ["A1", "B2", "C1"],
    ["A1", "B2", "C2"]
  ]
}
```

---

### 🧪 Tip

If you see a successful `200 OK` status and a JSON response like above, your API is working correctly.

You can now experiment with different values for `"items"` and `"length"` to generate various combinations.

![Database Schema](https://github.com/arziiann/test/blob/master/2025-07-09_10-23-24.png)
