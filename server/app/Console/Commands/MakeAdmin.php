<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    /**
     * @var string
     */
    protected $signature = 'admin:make {email : The email of the user to promote}';

    /**
     * @var string
     */
    protected $description = 'Promote an existing user to the admin role';

    public function handle(): int
    {
        $email = $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("Aucun utilisateur trouvé avec l'email : {$email}");
            return self::FAILURE;
        }

        $user->role = 'admin';
        $user->save();

        $this->info("✅ {$user->email} est maintenant administrateur.");
        return self::SUCCESS;
    }
}
