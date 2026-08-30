import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAProblem from '@/models/DSAProblem';
import User from '@/models/User';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();

        const users = await User.find({}).select('name email');
        const userIds = users.map((item) => item._id.toString());

        const problems = await DSAProblem.find({ userId: { $in: userIds } });
        const groupMap = new Map();

        for (const problem of problems) {
            const key = problem.userId.toString();
            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    total: 0,
                    solved: 0,
                    easy: 0,
                    medium: 0,
                    hard: 0,
                });
            }

            const stats = groupMap.get(key);
            stats.total += 1;
            if (problem.status === 'solved') {
                stats.solved += 1;
            }

            if (problem.difficulty === 'Easy') stats.easy += 1;
            if (problem.difficulty === 'Medium') stats.medium += 1;
            if (problem.difficulty === 'Hard') stats.hard += 1;
        }

        const leaderboard = users
            .map((member) => {
                const stats = groupMap.get(member._id.toString()) || { total: 0, solved: 0, easy: 0, medium: 0, hard: 0 };
                return {
                    _id: member._id,
                    name: member.name || 'Unknown user',
                    email: member.email || '',
                    total: stats.total,
                    solved: stats.solved,
                    easy: stats.easy,
                    medium: stats.medium,
                    hard: stats.hard,
                    score: stats.solved * 10 + stats.hard * 3 + stats.medium * 2,
                };
            })
            .sort((a, b) => b.score - a.score || b.solved - a.solved || a.name.localeCompare(b.name));

        return NextResponse.json(leaderboard, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
