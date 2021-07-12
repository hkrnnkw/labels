import React, { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { Label, SearchResult } from "../../utils/types";
import {
    Button,
} from '@material-ui/core';
import { addFavLabelToFirestore, deleteUnfavLabelFromFirestore } from "../../handlers/dbHandler";
import { searchAlbums } from "../../handlers/spotifyHandler";
import { setAddLabel, setDeleteLabel } from '../../stores/albums';

interface FollowButtonProps {
    uid: string,
    label: Label,
    tokenChecker: () => Promise<string>,
}

const ambiguousStyles = makeStyles((theme: Theme) => createStyles({
    contentClass: {
        minHeight: '100vh',
    },
    '@media (min-width: 960px)': {
        contentClass: {
            display: 'flex',
        },
    },
}));

export const FollowButton: FC<FollowButtonProps> = ({ uid, label, tokenChecker }) => {
    const dispatch = useDispatch();
    const classes = ambiguousStyles();
    const [isFollowing, setIsFollowing] = useState(label.date > 0);

    // フォロー操作
    const handleFollow = async () => {
        const doUnfollow: boolean = isFollowing;
        setIsFollowing(!isFollowing);
        try {
            // すでにフォローしている場合
            if (doUnfollow) {
                await deleteUnfavLabelFromFirestore(uid, label.name);
                dispatch(setDeleteLabel(label.name));
                return;
            }

            // フォローしていない場合
            const newDate: number = await addFavLabelToFirestore(uid, label.name);
            // ニューリリースを取得している場合（default labels）
            if (label.newReleases.length) {
                label.date = newDate;
                dispatch(setAddLabel(label));
            }
            else {
                const token: string = await tokenChecker();
                const result: SearchResult = await searchAlbums({ label: label.name, getNew: true }, token);
                const newLabel: Label = {
                    name: label.name,
                    date: newDate,
                    newReleases: result.albums,
                };
                dispatch(setAddLabel(newLabel));
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Button onClick={() => handleFollow()}>
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};