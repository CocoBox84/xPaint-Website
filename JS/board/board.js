class Board {
    constructor(board, permissions, user) {
        this.board = board;
        this.id = board.id;
        this.name = board.name;
        this.permissions = permissions;
        this.userRole = permissions.role;
        this.user = user;
    }

    updateBoardSettings() {
        
    }
}