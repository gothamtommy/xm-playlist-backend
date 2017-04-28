declare module namespace {

    export interface Setup {
        match_id: number;
        no_repick: number;
        no_agi: number;
        drp_itm: number;
        no_timer: number;
        rev_hs: number;
        no_swap: number;
        no_int: number;
        alt_pick: number;
        veto: number;
        shuf: number;
        no_str: number;
        no_pups: number;
        dup_h: number;
        ap: number;
        br: number;
        em: number;
        cas: number;
        rs: number;
        nl: number;
        officl: number;
        no_stats: number;
        ab: number;
        hardcore: number;
        dev_heroes: number;
        verified_only: number;
        gated: number;
        rapidfire: number;
    }

    export interface Player {
        account_id: number;
        match_id: number;
        nickname: string;
        lowercaseNickname: string;
        clan_id: number;
        hero_id: number;
        position: number;
        items: number[];
        team: number;
        level: number;
        win: boolean;
        concedes: number;
        concedevotes: number;
        buybacks: number;
        discos: number;
        kicked: number;
        mmr_change: number;
        herodmg: number;
        kills: number;
        assists: number;
        deaths: number;
        goldlost2death: number;
        secs_dead: number;
        cs: number;
        bdmg: number;
        razed: number;
        denies: number;
        exp_denied: number;
        consumables: number;
        wards: number;
        bloodlust: number;
        doublekill: number;
        triplekill: number;
        quadkill: number;
        annihilation: number;
        ks3: number;
        ks4: number;
        ks5: number;
        ks6: number;
        ks7: number;
        ks8: number;
        ks9: number;
        ks10: number;
        ks15: number;
        smackdown: number;
        humiliation: number;
        nemesis: number;
        retribution: number;
        used_token: number;
        time_earning_exp: number;
        teamcreepkills: number;
        teamcreepdmg: number;
        teamcreepexp: number;
        teamcreepgold: number;
        neutralcreepkills: number;
        neutralcreepdmg: number;
        neutralcreepexp: number;
        neutralcreepgold: number;
        actions: number;
        gold: number;
        exp: number;
        kdr: number;
        gpm: number;
        xpm: number;
        apm: number;
    }

    export interface RootObject {
        _id: string;
        match_id: number;
        setup: Setup;
        date: Date;
        length: number;
        version: string;
        map: string;
        server_id: number;
        c_state: number;
        mode: string;
        type: string;
        failed: boolean;
        players: Player[];
    }

}

