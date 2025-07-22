"use client"

// Local Imports
import { Button } from '../ui/button';
import { useOrganisationMembers } from '@/hooks/useOrganisationMembers';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

// External Imports
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2Icon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { IconDotsVertical } from '@tabler/icons-react';
import UpdateMemberDialog from './dialogs/UpdateMemberDialog';
import { Badge } from '../ui/badge';
import { IOrganisation } from '@/models/organisation';
import { levelFourAccess } from '@/utils/constants';
import { updateOrganisationMember } from '@/services/firebase/update';
import { IUser } from '@/models/user';
import { toast } from 'sonner';
import NoContent from '../ui/no-content';

const PAGE_SIZE = 10

interface Props {
    organisation: IOrganisation;
}
const MembersTable: React.FC<Props> = ({ organisation }) => {
    const { members, loading: loadingMembers, error: membersError, refetch: refetchMembers } = useOrganisationMembers(organisation?.id as string);

    // Pagination
    const [page, setPage] = useState(1)
    const pageCount = Math.ceil((members?.length ?? 0) / PAGE_SIZE)
    const pagedMembers = members?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];


    async function handleRemove(member: IUser) {
        try {
            const { error } = await updateOrganisationMember({ member, organisation, remove: true });
            if (error) throw error;

            toast("Member removed", {
                description: "This member has been successfully removed",
            });

        } catch {
            toast("Failed to remove member", {
                description: "Something went wrong while removing this member. Please try again.",
            });
        }
    }
    return (
        <Card>
            <CardContent className="overflow-x-auto">
                {loadingMembers ? (
                    <div className="flex justify-center p-4">
                        <Loader2Icon className="animate-spin h-6 w-6" />
                    </div>
                ) : membersError ? (
                    <NoContent text={membersError} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagedMembers.map((m) => (
                                <TableRow key={m.id} >
                                    <TableCell className="cursor-default">{m.firstname} {m.lastname}</TableCell>
                                    <TableCell className="cursor-default">{m.email}</TableCell>
                                    <TableCell className="cursor-default capitalize">
                                        <Badge variant="outline">
                                            {m.organisation?.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="cursor-default">
                                        {m.organisation?.joinedAt
                                            ? formatDistanceToNow(m.organisation?.joinedAt, { addSuffix: true })
                                            : "—"}
                                    </TableCell>
                                    <TableCell className='flex justify-end'>
                                        {!levelFourAccess.includes(m.organisation?.role as string) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                                        size="icon"
                                                    >
                                                        <IconDotsVertical />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32">
                                                    <UpdateMemberDialog member={m} organisation={m.organisation as IOrganisation} refetch={refetchMembers} />
                                                    <DropdownMenuItem variant="destructive" onClick={() => handleRemove(m)}>Remove</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pagedMembers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No members found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <CardFooter className="w-full flex justify-end">
                <Button
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className='rounded-r-none'
                >
                    <ChevronLeft />
                </Button>
                <Button
                    size="sm"
                    className='flex justify-center rounded-none'
                    disabled={page === pageCount || page === 1}
                >
                    {page} of {pageCount || 1}
                </Button>
                <Button
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    className='rounded-l-none'
                >
                    <ChevronRight />
                </Button>
            </CardFooter>
        </Card>
    )
}

export default MembersTable
