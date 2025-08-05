-- Migration: Add task_order column to existing tasks table
-- Run this in your Supabase SQL Editor if you already have data

-- Add the task_order column with a default value
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_order INTEGER DEFAULT 0;

-- Update existing tasks to have proper ordering within their categories
-- This assigns orders based on creation time within each category
WITH ordered_tasks AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at) - 1 as new_order
  FROM tasks
)
UPDATE tasks 
SET task_order = ordered_tasks.new_order
FROM ordered_tasks
WHERE tasks.id = ordered_tasks.id;

-- Create the index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks(category, task_order);

-- Verify the update worked
SELECT category, title, task_order, created_at 
FROM tasks 
ORDER BY category, task_order;
